import { ok, err, combine } from './shared/kernel'
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
import type { ResultAsync } from './shared/kernel'
import * as api from './api'
import { makeNqlFilter, compilePermalink } from './helpers'
import { do_, absurd } from './shared/utils'
import { createLogger } from './logger'
import { denormalizeResource } from './helpers/normalize'

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
    case 'Config':
    case 'Post': {
      return ok(undefined)
    }
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
      return ok(undefined)
    }
    default:
      return absurd(__typename)
  }
}

function createInternalResource(
  routesConfig: RoutesConfig,
  resourceNode: ResourceNode
) {
  const resourcePath = createResourcePath(routesConfig, resourceNode)
  if (resourcePath.isErr()) {
    return err(resourcePath.error)
  }

  const { __typename } = resourceNode
  switch (__typename) {
    case 'Post': {
      return createResource(resourceNode, resourcePath.value)
    }
    case 'Page': {
      return createResource(resourceNode, resourcePath.value)
    }
    case 'Author': {
      return createResource(resourceNode, resourcePath.value)
    }
    case 'Tag': {
      return createResource(resourceNode, resourcePath.value)
    }
    case 'Config': {
      return createResource(resourceNode, resourcePath.value)
    }
    default:
      return absurd(__typename)
  }
}

export function collect(
  routesConfig: RoutesConfig = {}
): ResultAsync<Resource[]> {
  log('start')
  const result = collectResourceNodes()
    .andThen((resourceNodes) => {
      const resourceResultList = resourceNodes.reduce<
        ReturnType<typeof createInternalResource>[]
      >((acc, current) => {
        const resourceItem = createInternalResource(routesConfig, current)

        if (resourceItem.isErr()) {
          acc.push(err(resourceItem.error))
          return acc
        }

        acc.push(resourceItem)

        return acc
      }, [])

      return combine(resourceResultList).andThen((resources) => {

        const resourceFilters = [
          ...getRoutes(routesConfig),
          ...getCollections(routesConfig),
        ].reduce<{
          post: string[]
          page: string[]
          author: string[]
          tag: string[]
        }>(
          (acc, [_, routeConfig]) => {
            if ('filter' in routeConfig && routeConfig.filter) {
              acc.post.push(routeConfig.filter)
            }
            if ('data' in routeConfig) {
              Object.values(routeConfig.data?.query ?? {})
                .filter(
                  (dataQuery): dataQuery is DataQueryBrowse =>
                    dataQuery.type === 'browse'
                )
                .forEach((dataQueryBrowse) => {
                  if (dataQueryBrowse.filter) {
                    acc[dataQueryBrowse.resourceType].push(
                      dataQueryBrowse.filter
                    )
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
                    ? taxonomyRoute.filter.replace(/%s/g, resource.slug)
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
                  // adding placeholder url to create valid post
                  // the actual url will be add below
                  return createPost({
                    ...postResourceResult.value,
                    path: '/placeholder',
                  })
                }
                case 'page': {
                  const pageResourceResult = denormalizeResource<PageResource>(
                    resource,
                    entities
                  )
                  if (pageResourceResult.isErr()) {
                    return err(pageResourceResult.error)
                  }
                  return createPage(pageResourceResult.value)
                }
                case 'author': {
                  const authorResourceResult =
                    denormalizeResource<AuthorResource>(resource, entities)
                  if (authorResourceResult.isErr()) {
                    return err(authorResourceResult.error)
                  }
                  return createAuthor(authorResourceResult.value)
                }
                case 'tag': {
                  const tagResourceResult = denormalizeResource<TagResource>(
                    resource,
                    entities
                  )
                  if (tagResourceResult.isErr()) {
                    return err(tagResourceResult.error)
                  }
                  return createTag(tagResourceResult.value)
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
              return resourceFilters[resource.resourceType].filter(
                (routeFilter) => {
                  const nqlFilter = makeNqlFilter(routeFilter)
                  const nqlFilterResult = nqlFilter(entryResult.value)
                  if (nqlFilterResult.isErr()) {
                    return false
                  }
                  return nqlFilterResult.value
                }
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

            return ok({
              ...resource,
              path: resourcePath,
              filters: [...new Set(matchingFilter)],
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
