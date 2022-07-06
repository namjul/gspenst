import { ok, err, combine, idSchema } from './shared/kernel'
import type { ResultAsync, Result } from './shared/kernel'
import * as db from './db'
import type {
  Resource,
  ResourceNode,
  PostResource,
  PageResource,
  AuthorResource,
  TagResource,
} from './domain/resource'
import type { RoutesConfig, DataQueryBrowse } from './domain/routes'
import { getCollections, getRoutes } from './domain/routes'
import { createResource, createDynamicVariables } from './domain/resource'
import { createPost } from './domain/post'
import { createPage } from './domain/page'
import { createAuthor } from './domain/author'
import { createTag } from './domain/tag'
import * as api from './api'
import { makeNqlFilter, compilePermalink } from './helpers'
import { do_, absurd, isString } from './shared/utils'
import { createLogger } from './logger'
import { denormalizeResource } from './helpers/normalize'
import * as Errors from './errors'
import { parse } from './helpers/parser'

const log = createLogger('collect')

function collectResourceNodes() {
  return combine([
    db.clear(),
    api.getConfig(),
    api.getTags(),
    api.getAuthors(),
    api.getPosts(),
    api.getPages(),
  ]).map((results) => {
    return results.flatMap<ResourceNode>((collectionResources) => {
      if (collectionResources === 'OK') {
        return []
      }

      return (
        do_(() => {
          if ('config' in collectionResources.data) {
            return collectionResources.data.config
          }
          if ('postConnection' in collectionResources.data) {
            return collectionResources.data.postConnection.edges?.flatMap(
              (collectionEdge) => {
                if (collectionEdge?.node) {
                  return collectionEdge.node
                }
                return []
              }
            )
          }
          if ('pageConnection' in collectionResources.data) {
            return collectionResources.data.pageConnection.edges?.flatMap(
              (collectionEdge) => {
                if (collectionEdge?.node) {
                  return collectionEdge.node
                }
                return []
              }
            )
          }
          if ('authorConnection' in collectionResources.data) {
            return collectionResources.data.authorConnection.edges?.flatMap(
              (collectionEdge) => {
                if (collectionEdge?.node) {
                  return collectionEdge.node
                }
                return []
              }
            )
          }
          if ('tagConnection' in collectionResources.data) {
            return collectionResources.data.tagConnection.edges?.flatMap(
              (collectionEdge) => {
                if (collectionEdge?.node) {
                  return collectionEdge.node
                }
                return []
              }
            )
          }
        }) ?? []
      )
    })
  })
}

function createResourcePath(
  routesConfig: RoutesConfig,
  resourceNode: ResourceNode
) {
  const { __typename } = resourceNode
  switch (__typename) {
    case 'Page': {
      const dynamicVariablesResult = createDynamicVariables(resourceNode)
      if (dynamicVariablesResult.isErr()) {
        return err(dynamicVariablesResult.error)
      }
      return ok(`/${dynamicVariablesResult.value.slug}`)
    }
    case 'Tag':
    case 'Author': {
      const dynamicVariablesResult = createDynamicVariables(resourceNode)
      if (dynamicVariablesResult.isErr()) {
        return err(dynamicVariablesResult.error)
      }
      const taxonomyEntry =
        resourceNode.__typename === 'Author'
          ? routesConfig.taxonomies?.author
          : routesConfig.taxonomies?.tag
      if (taxonomyEntry) {
        const permalinkResult = compilePermalink(
          taxonomyEntry.permalink,
          dynamicVariablesResult.value
        )
        if (permalinkResult.isErr()) {
          return err(permalinkResult.error)
        } else {
          return ok(permalinkResult.value)
        }
      }
    }
    // eslint-disable-next-line no-fallthrough
    default:
      return parse(idSchema, resourceNode.id).map((id) => `/${id}`)
  }
}

export function collect(
  routesConfig: RoutesConfig = {}
): ResultAsync<Resource[]> {
  log('start')
  // TODO make configurable so that only a single resource node can be collected
  const result = collectResourceNodes()
    .andThen((resourceNodes) => {
      const resourceResultList = resourceNodes.reduce<Result<Resource>[]>(
        (acc, current) => {
          const resourcePath = createResourcePath(routesConfig, current)
          if (resourcePath.isErr()) {
            acc.push(err(resourcePath.error))
          } else {
            const resourceItem = createResource(current).map((resource) => {
              const { resourceType } = resource
              switch (resourceType) {
                case 'page':
                case 'author':
                case 'tag':
                case 'post': {
                  resource.path = resourcePath.value
                  return resource
                }
                default:
                  return resource
              }
            })

            acc.push(resourceItem)
          }

          return acc
        },
        []
      )

      return combine(resourceResultList).andThen((resources) => {
        const resourcesFilters = [
          ...getRoutes(routesConfig).map((x) => [false, x] as const),
          ...getCollections(routesConfig).map((x) => [true, x] as const),
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
                  ('controller' in routeConfig && routeConfig.controller) ||
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
              ...resources.flatMap((resource) => {
                if (
                  resource.resourceType === 'tag' ||
                  resource.resourceType === 'author'
                ) {
                  const taxonomyRoute =
                    routesConfig.taxonomies?.[resource.resourceType]
                  return taxonomyRoute
                    ? {
                        controller: 'channel' as const,
                        filter: taxonomyRoute.filter.replace(
                          /%s/g,
                          resource.slug
                        ),
                        name: resource.resourceType,
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

        const entities = {
          configs: [],
          posts: [],
          pages: [],
          tags: [],
          authors: [],
          resources: resources.reduce<{ [id: string]: Resource }>(
            (map, resource) => {
              map[resource.id] = resource
              return map
            },
            {}
          ),
        }

        return combine(
          resources.flatMap((resource) => {
            if (resource.resourceType === 'config') {
              return ok(resource)
            }

            const entryResult = do_(() => {
              const { resourceType } = resource

              switch (resourceType) {
                case 'post': {
                  const postResourceResult = denormalizeResource<PostResource>(
                    resource,
                    entities
                  )
                  if (postResourceResult.isErr()) {
                    return err(postResourceResult.error)
                  }
                  return createPost(postResourceResult.value.tinaData.data.post)
                }
                case 'page': {
                  const pageResourceResult = denormalizeResource<PageResource>(
                    resource,
                    entities
                  )
                  if (pageResourceResult.isErr()) {
                    return err(pageResourceResult.error)
                  }
                  return createPage(pageResourceResult.value.tinaData.data.page)
                }
                case 'author': {
                  const authorResourceResult =
                    denormalizeResource<AuthorResource>(resource, entities)
                  if (authorResourceResult.isErr()) {
                    return err(authorResourceResult.error)
                  }
                  return createAuthor(
                    authorResourceResult.value.tinaData.data.author
                  )
                }
                case 'tag': {
                  const tagResourceResult = denormalizeResource<TagResource>(
                    resource,
                    entities
                  )
                  if (tagResourceResult.isErr()) {
                    return err(tagResourceResult.error)
                  }
                  return createTag(tagResourceResult.value.tinaData.data.tag)
                }
                default:
                  return absurd(resourceType)
              }
            })

            if (entryResult.isErr()) {
              return err(entryResult.error)
            }

            // calculate matching filters
            const matchingFilter = do_(() => {
              const resourceFilters = [
                ...resourcesFilters[resource.resourceType],
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
                      resource.filepath
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

            let resourcePath = resource.path

            // calculate resourcePath
            if (resource.resourceType === 'post') {
              // find owning collection
              const collectionRouteConfig = getCollections(routesConfig).find(
                ([_, collection]) => {
                  const nqlFilter = collection.filter
                    ? makeNqlFilter(collection.filter)
                    : () => ok(true)

                  const nqlFilterResult = nqlFilter(entryResult.value)
                  if (nqlFilterResult.isErr()) {
                    return false
                  }
                  return nqlFilterResult.value
                }
              )

              if (collectionRouteConfig) {
                const [ignored, { permalink }] = collectionRouteConfig
                const permalinkResult = compilePermalink(permalink, resource)
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
              ...resource,
              path: resourcePath,
              filters: [...new Set(matchingFilter.value)],
            })
          })
        )
      })
    })
    .map((x) => {
      log('end')
      return x
    })

  return result
}
