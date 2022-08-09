import merge from 'deepmerge'
import DataLoader from 'dataloader'
import { Semaphore } from 'async-mutex'
import type { SemaphoreInterface } from 'async-mutex'
import {
  combine,
  ok,
  err,
  okAsync,
  errAsync,
  fromPromise,
} from '../shared/kernel'
import { dynamicVariablesSchema } from '../domain/resource'
import type { DataQuery } from '../domain/routes'
import type { Resource, ResourceType } from '../domain/resource'
import type { Pagination, Data } from '../domain/theming'
import type { Entities } from '../domain/entity'
import type { Result, ResultAsync, ID } from '../shared/kernel'
import {
  assertUnreachable,
  removeNullish,
  isNumber,
  do_,
} from '../shared/utils'
import repository from '../repository'
import * as api from '../api'
import * as Errors from '../errors'
import { env } from '../domain/env'
import { createLogger } from '../logger'
// import {
//   isPostResource,
//   isPageResource,
//   isAuthorResource,
//   isTagResource,
// } from './resource'
import { parse } from './parser'
import {
  normalizeResource,
  normalizeResources,
  resolveResourceData,
} from './normalize'

const uniqid = Date.now()

const log = createLogger(`processQuery:${uniqid}`)

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

const REVALIDATE_MS =
  Number(process.env.GSPENST_REVALIDATE ?? env.GSPENST_REVALIDATE) * 1000

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
      return assertUnreachable(type)
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
                  return assertUnreachable(type)
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
      const x = combine([
        repository.sinceLastUpdate(new Date()),
        repository.get(resource.id),
      ])
        .andThen((result) => {
          const [updatedAt, _resource] = result as [number, Resource]
          if (isNumber(updatedAt)) {
            if (updatedAt > REVALIDATE_MS) {
              return ok({ type: 'miss' as const, resource, revalidate: true })
            }
          }
          return ok({ type: 'hit' as const, resource: _resource })
        })
        .unwrapOr({ type: 'miss' as const, resource, revalidate: false })
      return x
    })
  )
}

function batchLoadFromTina(sem: SemaphoreInterface) {
  // TODO use ResultAsync<Resource[]>
  return async (
    resources: ReadonlyArray<Resource>
  ): Promise<Result<Resource>[]> => {
    log(
      'load',
      resources.map((resource) => resource.relativePath)
    )
    // const batchResult = await sem.runExclusive(async () => {
    //   if (resources.every(isPostResource)) {
    //     return api
    //       .getPosts({
    //         filter: {
    //           slug: {
    //             in: resources.flatMap(
    //               ({ tinaData }) => tinaData.data.post.slug ?? []
    //             ),
    //           },
    //         },
    //       })
    //       .map((apiPostList) => {
    //         return resources.map((resource) => {
    //           const apiPost = apiPostList.find((_apiPost) => {
    //             return (
    //               _apiPost.data.data.post.slug ===
    //               resource.tinaData.data.post.slug
    //             )
    //           })
    //
    //           if (apiPost) {
    //             return ok({
    //               ...resource,
    //               tinaData: apiPost.data,
    //             })
    //           }
    //           return err(Errors.absurd('batchLoadFromTina'))
    //         })
    //       })
    //       .unwrapOr([err(Errors.other('batchLoadFromTina#unwrap'))])
    //   }
    //
    //   if (resources.every(isPageResource)) {
    //     return api
    //       .getPages({
    //         filter: {
    //           slug: {
    //             in: resources.flatMap(
    //               ({ tinaData }) => tinaData.data.page.slug ?? []
    //             ),
    //           },
    //         },
    //       })
    //       .map((apiPageList) => {
    //         return resources.map((resource) => {
    //           const apiPage = apiPageList.find((_apiPage) => {
    //             return (
    //               _apiPage.data.data.page.slug ===
    //               resource.tinaData.data.page.slug
    //             )
    //           })
    //
    //           if (apiPage) {
    //             return ok({
    //               ...resource,
    //               tinaData: apiPage.data,
    //             })
    //           }
    //           return err(Errors.absurd('batchLoadFromTina'))
    //         })
    //       })
    //       .unwrapOr([err(Errors.other('batchLoadFromTina#unwrap'))])
    //   }
    //
    //   if (resources.every(isAuthorResource)) {
    //     return api
    //       .getAuthors({
    //         filter: {
    //           slug: {
    //             in: resources.flatMap(
    //               ({ tinaData }) => tinaData.data.author.slug ?? []
    //             ),
    //           },
    //         },
    //       })
    //       .map((apiAuthorList) => {
    //         return resources.map((resource) => {
    //           const apiAuthor = apiAuthorList.find((_apiAuthor) => {
    //             return (
    //               _apiAuthor.data.data.author.slug ===
    //               resource.tinaData.data.author.slug
    //             )
    //           })
    //
    //           if (apiAuthor) {
    //             return ok({
    //               ...resource,
    //               tinaData: apiAuthor.data,
    //             })
    //           }
    //           return err(Errors.absurd('batchLoadFromTina'))
    //         })
    //       })
    //       .unwrapOr([err(Errors.other('batchLoadFromTina#unwrap'))])
    //   }
    //
    //   if (resources.every(isTagResource)) {
    //     return api
    //       .getTags({
    //         filter: {
    //           slug: {
    //             in: resources.flatMap(
    //               ({ tinaData }) => tinaData.data.tag.slug ?? []
    //             ),
    //           },
    //         },
    //       })
    //       .map((apiTagList) => {
    //         return resources.map((resource) => {
    //           const apiTag = apiTagList.find((_apiTag) => {
    //             return (
    //               _apiTag.data.data.tag.slug === resource.tinaData.data.tag.slug
    //             )
    //           })
    //
    //           if (apiTag) {
    //             return ok({
    //               ...resource,
    //               tinaData: apiTag.data,
    //             })
    //           }
    //           return err(Errors.absurd('batchLoadFromTina'))
    //         })
    //       })
    //       .unwrapOr([err(Errors.other('batchLoadFromTina#unwrap'))])
    //   }
    // })
    //
    // if (batchResult) {
    //   return batchResult
    // }

    return Promise.all(
      resources.map(async (resource) => {
        return sem.runExclusive(async () => {
          const x = do_(() => {
            const { type, relativePath } = resource
            switch (type) {
              case 'page':
                return api.getPage({ relativePath }).map((apiPage) => ({
                  ...resource,
                  tinaData: apiPage.data,
                }))
              case 'post':
                return api.getPost({ relativePath }).map((apiPost) => ({
                  ...resource,
                  tinaData: apiPost.data,
                }))
              case 'author':
                return api.getAuthor({ relativePath }).map((apiAuthor) => ({
                  ...resource,
                  tinaData: apiAuthor.data,
                }))
              case 'tag':
                return api.getTag({ relativePath }).map((apiTag) => ({
                  ...resource,
                  tinaData: apiTag.data,
                }))
              case 'config':
                return api.getConfig().map((apiConfig) => ({
                  ...resource,
                  tinaData: apiConfig.data,
                }))
              default:
                return assertUnreachable(type)
            }
          })
          return x
        })
      })
    )
  }
}

export function createLoaders(sem: SemaphoreInterface = defaultSem) {
  const fastResourceLoader = new DataLoader<
    Resource,
    | { type: 'hit'; resource: Resource }
    | { type: 'miss'; resource: Resource; revalidate: boolean },
    ID
  >(batchLoadFromRedis, {
    cacheKeyFn: (resource) => resource.id,
  })

  const slowResourceLoader = new DataLoader<Resource, Result<Resource>, ID>(
    batchLoadFromTina(sem),
    {
      cacheKeyFn: (resource) => resource.id,
    }
  )

  const loadManyResource = (resources: Resource[]) => {
    return fromPromise(
      fastResourceLoader.loadMany(resources),
      (error: unknown) =>
        Errors.other(
          `loadManyResource ${JSON.stringify(error, null, 2)}`,
          error instanceof Error ? error : undefined
        )
    ).andThen((dataLoaderResult) => {
      return combine(
        dataLoaderResult.map((resourceResultOrError) => {
          if (resourceResultOrError instanceof Error) {
            return errAsync(
              Errors.other(
                `loadResource ${JSON.stringify(
                  resourceResultOrError,
                  null,
                  2
                )}`,
                resourceResultOrError instanceof Error
                  ? resourceResultOrError
                  : undefined
              )
            )
          }
          const { type, resource } = resourceResultOrError
          log(
            type,
            resource.relativePath,
            type === 'miss' ? resourceResultOrError.revalidate : undefined
          )
          if (type === 'miss') {
            return fromPromise(
              slowResourceLoader.load(resource),
              (error: unknown) =>
                Errors.other(
                  `loadManyResource ${JSON.stringify(error, null, 2)}`,
                  error instanceof Error ? error : undefined
                )
            )
              .andThen((x) => x)
              .andThen((_resource) => {
                return repository.set(_resource).map(() => _resource)
              })
              .map((_resource) => {
                log('Found from Tina: ', _resource.relativePath)
                return _resource
              })
          }

          log('Found from Redis: ', resource.relativePath)
          return okAsync(resource)
        })
      )
    })
  }

  const loadResource = (resource: Resource) => {
    return loadManyResource([resource]).andThen((resources) => {
      const _resource = resources.at(0)
      if (_resource) {
        return ok(_resource)
      }
      return err(Errors.absurd('loadResource'))
    })
  }

  return {
    loadResource,
    loadManyResource,
  }
}
