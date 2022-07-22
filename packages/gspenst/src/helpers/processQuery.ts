import merge from 'deepmerge'
import DataLoader from 'dataloader'
import { Semaphore } from 'async-mutex'
import type { SemaphoreInterface } from 'async-mutex'
import { combine, ok, err, fromPromise } from '../shared/kernel'
import { dynamicVariablesSchema } from '../domain/resource'
import type { DataQuery } from '../domain/routes'
import type { Resource, ResourceType } from '../domain/resource'
import type { Pagination, Data } from '../domain/theming'
import type { Entities } from '../domain/entity'
import type { Result, ResultAsync, ID } from '../shared/kernel'
import { absurd, removeNullish, isNumber, do_ } from '../shared/utils'
import repository from '../repository'
import * as api from '../api'
import * as Errors from '../errors'
import { parse } from './parser'
import {
  normalizeResource,
  normalizeResources,
  resolveResourceData,
} from './normalize'

export type QueryOutcomeRead = {
  type: 'read'
  resourceType: ResourceType
  resource: Resource
  entities: Entities
}

export type QueryOutcomeBrowse = {
  type: 'browse'
  resourceType: ResourceType
  pagination: Pagination
  resources: ID[]
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
            .andThen(normalizeResource)
            .andThen(({ result, entities }) => {
              const resource = entities.resource[result]
              if (!resource) {
                return err(
                  Errors.absurd(
                    `Should not happen: resource ${result} not found`
                  )
                )
              }

              const queryOutcomeRead: QueryOutcomeRead = {
                type,
                resourceType: query.resourceType,
                resource,
                entities,
              }
              return ok(queryOutcomeRead)
            })
        }
      )
    case 'browse': {
      const limit = query.limit
      const page = limit === 'all' ? 1 : query.page ?? 1

      return repository
        .findAll(query.resourceType)
        .map(async (resources) => {
          const { default: sortOn } = await import('sort-on')
          const { default: filterObject } = await import('filter-obj')
          return {
            resources,
            sortOn,
            filterObject,
          }
        })
        .andThen(({ resources, sortOn }) => {
          // 1. apply filter
          const filteredResources = resources.flatMap((resource) => {
            if (query.filter) {
              if (resource.filters.includes(query.filter)) {
                return resource
              }
              return []
            }
            return resource
          })

          return combine(
            filteredResources.map((resource) => resolveResourceData(resource))
          )
            .map((x) => x.flat())
            .map((entityList) => {
              const property = query.order?.map((orderValue) => {
                return `${orderValue.order === 'desc' ? '-' : ''}${
                  orderValue.field
                }`
              })
              // 2. apply sorting
              return property ? sortOn(entityList, property) : entityList
            })
            .map((sortedEntityList) => {
              return sortedEntityList.flatMap((entity) => {
                return (
                  filteredResources.find(
                    (resource) => resource.id === entity.id
                  ) ?? []
                )
              })
            })
            .map((entityResultList) => {
              let start = 0
              let end: number | undefined

              if (limit !== 'all') {
                start = (page - 1) * limit
                end = start + limit
              }

              return {
                // 3. apply limit
                resources: entityResultList.slice(start, end),
                total: entityResultList.length,
                start,
                end,
              }
            })
        })
        .andThen(({ resources, ...rest }) =>
          loadManyResource(resources).map((loadedResources) => {
            return { ...rest, resources: loadedResources }
          })
        )
        .andThen(({ resources, ...rest }) =>
          normalizeResources(resources).map(({ result, entities }) => {
            return { result, entities, ...rest }
          })
        )
        .andThen(({ result, entities, total, start, end }) => {
          const entityResourcesResult = combine(
            result.map((id) => {
              const resource = entities.resource[id]
              if (!resource) {
                return err(
                  Errors.absurd(
                    `Should not happen: resource ${result} not found`
                  )
                )
              }

              const entity = entities[resource.type][id]
              return ok({
                resource,
                entity,
              })
            })
          )

          if (entityResourcesResult.isErr()) {
            return err(entityResourcesResult.error)
          }

          const entityResources = entityResourcesResult.value

          let pages = 1
          let prev: number | null = null
          let next: number | null = null

          if (limit !== 'all') {
            pages = Math.floor(total / limit)
            start = (page - 1) * limit
            end = start + limit
            prev = start > 0 ? page - 1 : null
            next = end < entityResources.length ? page + 1 : null
          }

          return ok({
            type,
            pagination: {
              total,
              limit,
              pages,
              page,
              prev,
              next,
            },
            resources: result,
            resourceType: query.resourceType,
            entities,
          })
        })
    }

    default:
      return absurd(type)
  }
}

type ProcessData = {
  data: Record<string, Data>
  entities: Entities
}
export function processData(
  dataLoaders: DataLoaders,
  data: { [name: string]: DataQuery } = {}
): ResultAsync<ProcessData> {
  const keys = Object.keys(data)
  const result = combine(
    keys.map((key) => {
      return processQuery(dataLoaders, data[key]!)
    })
  ).map((outcomes) => {
    return keys.reduce<ProcessData>(
      (acc, current, index) => {
        const queryOutcome = outcomes[index]
        if (!queryOutcome) {
          return acc
        }
        const { entities, ...queryOutcomeRest } = queryOutcome

        return {
          data: {
            ...acc.data,
            [current]: do_(() => {
              const { type } = queryOutcomeRest

              switch (type) {
                case 'read': {
                  const { resource, resourceType } = queryOutcomeRest
                  return {
                    type,
                    resourceType,
                    resource: resource.id,
                  }
                }
                case 'browse': {
                  const { resources, pagination, resourceType } =
                    queryOutcomeRest
                  return {
                    type,
                    resourceType,
                    resources,
                    pagination,
                  }
                }
                default:
                  return absurd(type)
              }
            }),
          },
          // TODO maybe confify here
          entities: merge(acc.entities, entities),
        }
      },
      {
        data: {},
        entities: {
          post: {},
          page: {},
          author: {},
          tag: {},
          config: {},
          resource: {},
        },
      }
    )
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
        const { type, relativePath } = resource
        return sem.runExclusive(async () => {
          switch (type) {
            case 'page':
              return api.getPage({ relativePath }).map((tinaData) => ({
                ...resource,
                tinaData: tinaData.data,
              }))
            case 'post':
              return api.getPost({ relativePath }).map((tinaData) => ({
                ...resource,
                tinaData: tinaData.data,
              }))
            case 'author':
              return api.getAuthor({ relativePath }).map((tinaData) => ({
                ...resource,
                tinaData: tinaData.data,
              }))
            case 'tag':
              return api.getTag({ relativePath }).map((tinaData) => ({
                ...resource,
                tinaData: tinaData.data,
              }))
            case 'config':
              return api.getConfig().map((tinaData) => ({
                ...resource,
                tinaData: tinaData.data,
              }))
            default:
              return absurd(type)
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
