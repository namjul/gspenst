import {
  type GspenstResultAsync,
  ok,
  err,
  Result,
  ResultAsync,
} from './shared/kernel'
import * as db from './db'
import {
  type RoutesConfigInput,
  type DataQueryBrowse,
  getCollections,
  getRoutes,
} from './domain/routes'
import { type Resource } from './domain/resource'
import { createRoutesResource } from './domain/resource/resource.routes'
import { createLocatorResource } from './domain/resource/resource.locator'
import { createPost } from './domain/post'
import { createPage } from './domain/page'
import { createAuthor } from './domain/author'
import { createTag } from './domain/tag'
import * as api from './api'
import { compilePermalink } from './utils'
import { makeNqlFilter } from './helpers/nqlFilter'
import { do_, assertUnreachable, isString } from './shared/utils'
import { createLogger } from './logger'
import * as Errors from './errors'
import { createConfigResource } from './domain/resource/resource.config'

const log = createLogger('collect')

export function collect(
  routesConfigInput: RoutesConfigInput
): GspenstResultAsync<Resource[]> {
  log('start')

  const result = db
    .clear()
    .andThen(() => createRoutesResource(routesConfigInput))
    .andThen((routesResource) => {
      // TODO make configurable so that only a single resource node can be collected
      return api
        .getConfig()
        .andThen((configResourceNode) => {
          return createConfigResource(
            configResourceNode.data.data.config,
            configResourceNode.timestamp
          )
        })
        .andThen((configResource) => {
          return ResultAsync.combine([
            api.getTags(),
            api.getAuthors(),
            api.getPosts(),
            api.getPages(),
          ]).andThen((resourceNodes) => {
            const routesConfig = routesResource.data
            const locatorResourcesResultList = resourceNodes
              .flat()
              .map((resourceNode) => {
                const resourceData = do_(() => {
                  const { type } = resourceNode
                  switch (type) {
                    case 'post':
                      return resourceNode.data.data.post
                    case 'page':
                      return resourceNode.data.data.page
                    case 'author':
                      return resourceNode.data.data.author
                    case 'tag':
                      return resourceNode.data.data.tag
                    default:
                      assertUnreachable(type, 'createResource')
                  }
                })
                return createLocatorResource(
                  resourceData,
                  resourceNode.timestamp
                ).andThen((resource) => {
                  const { type } = resource

                  if (type === 'tag' || type === 'author') {
                    const taxonomyEntry = routesConfig.taxonomies?.[type]
                    if (taxonomyEntry) {
                      return compilePermalink(
                        taxonomyEntry.permalink,
                        resource.metadata
                      ).map((permalink) => ({
                        ...resource,
                        metadata: {
                          ...resource.metadata,
                          path: permalink,
                        },
                      }))
                    }
                  }

                  return ok(resource)
                })
              })
            return Result.combine(locatorResourcesResultList).andThen(
              (locatorResources) => {
                const resourcesFilters = [
                  ...getRoutes(routesConfig).map(
                    (xxx) => [false, xxx] as const
                  ),
                  ...getCollections(routesConfig).map(
                    (xxx) => [true, xxx] as const
                  ),
                ].reduce<{
                  post: Array<
                    | { controller: 'channel'; filter: string; name: string }
                    | {
                        controller: 'collection'
                        filter: string | undefined
                        name: string
                      }
                  >
                  page: string[]
                  author: string[]
                  tag: string[]
                }>(
                  (acc, [partOfCollection, [name, routeConfig]]) => {
                    if (partOfCollection) {
                      acc.post.push({
                        controller: 'collection',
                        filter: routeConfig.filter,
                        name,
                      })
                    } else if ('filter' in routeConfig && routeConfig.filter) {
                      acc.post.push({
                        controller:
                          ('controller' in routeConfig &&
                            routeConfig.controller) ||
                          'collection',
                        filter: routeConfig.filter,
                        name,
                      })
                    }
                    if ('data' in routeConfig) {
                      Object.values(routeConfig.data?.query ?? {})
                        .filter(
                          (dataQuery): dataQuery is DataQueryBrowse =>
                            dataQuery.type === 'browse'
                        )
                        .forEach((dataQueryBrowse) => {
                          if (dataQueryBrowse.filter) {
                            if (dataQueryBrowse.resourceType === 'post') {
                              acc[dataQueryBrowse.resourceType].push({
                                controller: 'channel',
                                filter: dataQueryBrowse.filter,
                                name,
                              })
                            } else {
                              acc[dataQueryBrowse.resourceType].push(
                                dataQueryBrowse.filter
                              )
                            }
                          }
                        })
                    }

                    return acc
                  },
                  {
                    post: [
                      ...locatorResources.flatMap((resource) => {
                        if (
                          resource.type === 'tag' ||
                          resource.type === 'author'
                        ) {
                          const taxonomyRoute =
                            routesConfig.taxonomies?.[resource.type]
                          return taxonomyRoute
                            ? {
                                controller: 'channel' as const,
                                filter: taxonomyRoute.filter.replace(
                                  /%s/g,
                                  resource.metadata.slug
                                ),
                                name: resource.type,
                              }
                            : []
                        }
                        return []
                      }),
                    ],
                    page: [],
                    author: [],
                    tag: [],
                  }
                )

                const locatorResourceResultList = locatorResources.flatMap(
                  (locatorResource) => {
                    const entryResult = do_(() => {
                      const { type } = locatorResource

                      switch (type) {
                        case 'post': {
                          return createPost(locatorResource.data.data.post)
                        }
                        case 'page': {
                          return createPage(locatorResource.data.data.page)
                        }
                        case 'author': {
                          return createAuthor(locatorResource.data.data.author)
                        }
                        case 'tag': {
                          return createTag(locatorResource.data.data.tag)
                        }
                        default:
                          return assertUnreachable(type, 'collect')
                      }
                    })

                    if (entryResult.isErr()) {
                      return err(entryResult.error)
                    }

                    // calculate matching filters
                    const matchingFilter = do_(() => {
                      const resourceFilters = [
                        ...resourcesFilters[locatorResource.type],
                      ].filter((routeFilter) => {
                        const nqlFilterValue = isString(routeFilter)
                          ? routeFilter
                          : routeFilter.filter
                        if (!nqlFilterValue) {
                          return true
                        }
                        const nqlFilter = makeNqlFilter(nqlFilterValue)
                        const nqlFilterResult = nqlFilter(entryResult.value)
                        if (nqlFilterResult.isErr()) {
                          return false
                        }
                        return nqlFilterResult.value
                      })

                      const collectionResourceFilters = resourceFilters.flatMap(
                        (resourceFilter) => {
                          return !isString(resourceFilter) &&
                            resourceFilter.controller === 'collection'
                            ? resourceFilter
                            : []
                        }
                      )
                      if (collectionResourceFilters.length > 1) {
                        return err(
                          Errors.validation({
                            message: 'Collections must be unique',
                            help: `${
                              locatorResource.metadata.path
                            } contained in multiple collections ${collectionResourceFilters.map(
                              ({ name }) => name
                            )}`,
                          })
                        )
                      }

                      return ok(
                        resourceFilters.flatMap((resourceFilter) => {
                          return isString(resourceFilter)
                            ? resourceFilter
                            : resourceFilter.filter ?? []
                        })
                      )
                    })

                    let resourcePath = locatorResource.metadata.path

                    // calculate resourcePath
                    if (locatorResource.type === 'post') {
                      // find owning collection
                      const collectionRouteConfig = getCollections(
                        routesConfig
                      ).find(([_, collection]) => {
                        const nqlFilter = collection.filter
                          ? makeNqlFilter(collection.filter)
                          : () => ok(true)

                        const nqlFilterResult = nqlFilter(entryResult.value)
                        if (nqlFilterResult.isErr()) {
                          return false
                        }
                        return nqlFilterResult.value
                      })

                      if (collectionRouteConfig) {
                        const [ignored, { permalink }] = collectionRouteConfig
                        const permalinkResult = compilePermalink(
                          permalink,
                          locatorResource.metadata
                        )
                        if (permalinkResult.isErr()) {
                          return err(permalinkResult.error)
                        }
                        resourcePath = permalinkResult.value
                      }
                    }

                    if (matchingFilter.isErr()) {
                      return matchingFilter
                    }

                    return ok({
                      ...locatorResource,
                      metadata: {
                        ...locatorResource.metadata,
                        path: resourcePath,
                        filters: [...new Set(matchingFilter.value)],
                      },
                    })
                  }
                )
                const resourceResultList = [
                  ok(routesResource),
                  ok(configResource),
                  ...locatorResourceResultList,
                ]
                return Result.combine(resourceResultList)
              }
            )
          })
        })
    })
    .map((x) => {
      log('end')
      return x
    })

  return result
}
