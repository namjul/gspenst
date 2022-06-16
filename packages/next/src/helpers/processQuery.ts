import sortOn from 'sort-on'
import DataLoader from 'dataloader'
import { Semaphore } from 'async-mutex'
import type { SemaphoreInterface } from 'async-mutex'
import { combine, ok, err, fromPromise } from '../shared-kernel'
import type { DataQuery, Limit } from '../domain/routes'
import type { Resource } from '../domain/resource'
import type { Result, ResultAsync, ID } from '../shared-kernel'
import { absurd, removeNullish, isNumber } from '../shared/utils'
import repository from '../repository'
import * as api from '../api'
import { dynamicVariablesSchema } from '../domain/resource'
import * as Errors from '../errors'
import { parse } from './parser'
import { normalizeResource, normalizeResources } from './normalize'
import type { Entities } from './normalize'

type Pagination = {
  page: number // the current page number
  prev: number | null // the previous page number
  next: number | null // the next page number
  pages: number // the number of pages available
  total: number // the number of posts available
  limit: Limit // the number of posts per page
}

export type QueryOutcomeRead = {
  type: 'read'
  resource: Resource
  entities: Entities
}

export type QueryOutcomeBrowse = {
  type: 'browse'
  pagination: Pagination
  resources: Resource[]
  entities: Entities
}

export type QueryOutcome = QueryOutcomeRead | QueryOutcomeBrowse

const REVALIDATE = 60

const defaultSem = new Semaphore(100)

export type DataLoaders = ReturnType<typeof createLoaders>

type ResultAsyncQueryOutcome<T> = T extends Extract<DataQuery, { type: 'read' }>
  ? ResultAsync<Extract<QueryOutcome, { type: 'read' }>>
  : ResultAsync<Extract<QueryOutcome, { type: 'browse' }>>

export function processQuery<T extends DataQuery>(
  dataLoaders: DataLoaders,
  query: T
): ResultAsyncQueryOutcome<T>
export function processQuery(
  dataLoaders: DataLoaders,
  query: DataQuery
): ResultAsync<QueryOutcome> {
  const { loadResource, loadManyResource } = dataLoaders

  const { type } = query

  switch (type) {
    case 'read':
      return parse(dynamicVariablesSchema.partial(), query).asyncAndThen(
        (dynamicVariables) => {
          return repository
            .find(removeNullish(dynamicVariables))
            .andThen(loadResource)
            .andThen((resource) =>
              repository.getDenormalized(resource.id).andThen(normalizeResource)
            )
            .andThen(({ result, entities }) => {
              const { resources = {} } = entities
              const resource = resources[result]
              if (!resource) {
                return err(
                  Errors.other(
                    `Should not happen: resource ${result} not found`
                  )
                )
              }
              const queryOutcomeRead: QueryOutcomeRead = {
                type,
                resource,
                entities,
              }
              return ok(queryOutcomeRead)
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
        .andThen((resources) =>
          repository
            .getDenormalized(resources.map(({ id }) => id))
            .andThen(normalizeResources)
        )
        .map(({ result, entities }) => {
          const entityResources = result.map((id) => {
            const { resources = {} } = entities
            const resource = resources[id]!
            const entityType = `${resource.resourceType}s` as const
            const entity = entities[entityType]![id]
            return {
              resource,
              entity,
            }
          })

          const property = query.order?.map((orderValue) => {
            return `${orderValue.order === 'desc' ? '-' : ''}entity.${
              orderValue.field
            }`
          })

          const sortedResources = property
            ? sortOn(entityResources, property)
            : entityResources

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
            entities,
          }
        })

    default:
      return absurd(type)
  }
}

export function processData(
  dataLoaders: DataLoaders,
  data: { [name: string]: DataQuery } = {}
) {
  const keys = Object.keys(data)
  const result = combine(
    keys.map((key) => {
      return processQuery(dataLoaders, data[key]!)
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

async function batchLoadFromRedis(resources: ReadonlyArray<Resource>) {
  return Promise.all(
    resources.map(async (resource) => {
      return combine([
        repository.sinceLastUpdate(new Date()),
        repository.get(resource.id),
      ]).andThen((result) => {
        const [updatedAt, _resource] = result as [number, Resource]
        if (isNumber(updatedAt)) {
          if (updatedAt > REVALIDATE) {
            return err(Errors.other('Revlidate resource'))
          }
        }
        return ok(_resource)
      })
    })
  )
}

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
            case 'config':
              return api.getConfig().map((tinaData) => ({
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

export function createLoaders(sem: SemaphoreInterface = defaultSem) {
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
