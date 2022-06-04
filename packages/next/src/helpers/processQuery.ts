import sortOn from 'sort-on'
import DataLoader from 'dataloader'
import { Semaphore } from 'async-mutex'
import type { SemaphoreInterface } from 'async-mutex'
import type { DataQuery } from '../domain/routes'
import type { Resource } from '../domain/resource'
import type { Result, ResultAsync, ID } from '../shared-kernel'
import { do_, absurd, removeNullish, isNumber } from '../shared/utils'
import repository from '../repository'
import { combine, ok, err, fromPromise } from '../shared-kernel'
import * as api from '../api'
import type { Pagination } from '../domain/theming'
import { createPost } from '../domain/post'
import { createPage } from '../domain/page'
import { createAuthor } from '../domain/author'
import { createTag } from '../domain/tag'
import { dynamicVariablesSchema } from '../domain/resource'
import * as Errors from '../errors'
import { parse } from './parser'

type ReadQueryOutcome = { type: 'read' } & { resource: Resource }
type BrowseQueryOutcome = {
  type: 'browse'
  pagination: Pagination
  resources: Resource[]
  // resources: ID[]
  // entities: {
  //   resources: { [id: ID]: ResourceNormalized }
  // }
}
type QueryOutcome = ReadQueryOutcome | BrowseQueryOutcome

function batchLoadFromTina(sem: SemaphoreInterface) {
  return async (resources: ReadonlyArray<Resource>) => {
    return Promise.all(
      resources.map(async (resource) => {
        const { resourceType, relativePath } = resource
        return sem.runExclusive(async () => {
          switch (resourceType) {
            case 'page':
              return api.getPage({ relativePath }).map((tinaData) => ({
                ...resource,
                tinaData,
              }))
            case 'post':
              return api.getPost({ relativePath }).map((tinaData) => ({
                ...resource,
                tinaData,
              }))
            case 'author':
              return api.getAuthor({ relativePath }).map((tinaData) => ({
                ...resource,
                tinaData,
              }))
            case 'tag':
              return api.getTag({ relativePath }).map((tinaData) => ({
                ...resource,
                tinaData,
              }))
            default:
              return absurd(resourceType)
          }
        })
      })
    )
  }
}

const REVALIDATE = 60

async function batchLoadFromRedis(resources: ReadonlyArray<Resource>) {
  return Promise.all(
    resources.map(async (resource) => {
      return combine([
        repository.sinceLastUpdate(new Date()),
        repository.get(resource.id),
      ]).andThen((result) => {
        const [updatedAt, resource] = result as [number, Resource]
        if (isNumber(updatedAt)) {
          console.log(`revalidate ${resource.id} ${updatedAt}`)
          if (updatedAt > REVALIDATE) {
            return err(Errors.other('Revlidate resource'))
          }
        }
        return ok(resource)
      })
    })
  )
}

const defaultSem = new Semaphore(100)

export const createLoaders = (sem: SemaphoreInterface = defaultSem) => {
  const fastResourceLoader = new DataLoader<Resource, Result<Resource>, ID>(
    batchLoadFromRedis,
    {
      cacheKeyFn: (resource) => resource.id,
    }
  )

  const slowResourceLoader = new DataLoader<Resource, Result<Resource>, ID>(
    batchLoadFromTina(sem),
    {
      cacheKeyFn: (resource) => resource.id,
    }
  )

  const loadResource = (resource: Resource) => {
    return fromPromise(fastResourceLoader.load(resource), (error: unknown) =>
      Errors.other(
        `loadResource ${JSON.stringify(error, null, 2)}`,
        error instanceof Error ? error : undefined
      )
    )
      .andThen((x) => x)
      .orElse(() => {
        return fromPromise(
          slowResourceLoader.load(resource),
          (error: unknown) =>
            Errors.other(
              `loadResource ${JSON.stringify(error, null, 2)}`,
              error instanceof Error ? error : undefined
            )
        )
          .andThen((x) => x)
          .andThen((_resource) => {
            return repository.set(_resource).map(() => _resource)
          })
      })
  }

  const loadManyResource = (resources: Resource[]) => {
    return combine(resources.map(loadResource))
  }
  return {
    loadResource,
    loadManyResource,
  }
}

export type DataLoaders = ReturnType<typeof createLoaders>

type ResultAsyncQueryOutcome<T> = T extends Extract<DataQuery, { type: 'read' }>
  ? ResultAsync<Extract<QueryOutcome, { type: 'read' }>>
  : ResultAsync<Extract<QueryOutcome, { type: 'browse' }>>

export function processQuery<T extends DataQuery>(
  query: T,
  dataLoaders: DataLoaders
): ResultAsyncQueryOutcome<T>
export function processQuery(
  query: DataQuery,
  dataLoaders: DataLoaders
): ResultAsync<QueryOutcome> {
  const { loadResource, loadManyResource } = dataLoaders

  const { type } = query

  const result = do_(() => {
    switch (type) {
      case 'read':
        return parse(dynamicVariablesSchema.partial(), query).asyncAndThen(
          (dynamicVariables) => {
            return repository
              .find(removeNullish(dynamicVariables)) // TODO if not found, check if `slug` is used and load resource with it
              .andThen(loadResource)
              .map((resource) => {
                return { type, resource }
              })
          }
        )
      case 'browse':
        return repository
          .findAll(query.resourceType)
          .map((resources) => {
            // apply filter
            return resources.flatMap((resource) => {
              if (query.filter) {
                if (resource.filters?.includes(query.filter)) {
                  return resource
                }
                return []
              }
              return resource
            })
          })
          .andThen(loadManyResource)
          .andThen((enrichedResources) => {
            return combine(
              enrichedResources.flatMap((resource) => {
                const entity = do_(() => {
                  const { resourceType } = resource
                  switch (resourceType) {
                    case 'post':
                      return createPost(resource.tinaData.data.post)
                    case 'page':
                      return createPage(resource.tinaData.data.page)
                    case 'author':
                      return createAuthor(resource.tinaData.data.author)
                    case 'tag':
                      return createTag(resource.tinaData.data.tag)
                    default:
                      return absurd(resourceType)
                  }
                })

                if (entity.isErr()) {
                  return err(entity.error)
                }

                return ok({ resource, entity: entity.value })
              })
            )
          })
          .map((filteredResources) => {
            const property = query.order?.map((orderValue) => {
              return `${orderValue.order === 'desc' ? '-' : ''}entity.${
                orderValue.field
              }`
            })

            const sortedResources = property
              ? sortOn(filteredResources, property)
              : filteredResources

            const limit = query.limit
            const total = sortedResources.length
            let page = query.page ?? 1
            let pages = 1
            let start = 0
            let end
            let prev = null
            let next = null

            if (limit === 'all') {
              page = 1
            } else {
              pages = Math.floor(total / limit)
              start = (page - 1) * limit
              end = start + limit
              prev = start > 0 ? page - 1 : null
              next = end < sortedResources.length ? page + 1 : null
            }

            const resources = sortedResources.slice(start, end)

            return {
              type,
              pagination: {
                total,
                limit,
                pages,
                page,
                prev,
                next,
              },
              resources: resources.map(({ resource }) => resource),
            }
          })

      default:
        return absurd(type)
    }
  })

  return result
}

export function processData(
  data: { [name: string]: DataQuery },
  dataLoaders: DataLoaders
) {
  const keys = Object.keys(data)
  const result = combine(
    keys.map((key) => {
      return processQuery(data[key]!, dataLoaders)
    })
  ).map((outcomes) => {
    const dataEntries = keys.reduce<{
      [name: string]: typeof outcomes[number]
    }>((acc, current, index) => {
      const queryOutcome = outcomes[index]
      if (!queryOutcome) {
        return acc
      }
      return {
        ...acc,
        [current]: queryOutcome,
      }
    }, {})

    return dataEntries
  })

  return result
}
