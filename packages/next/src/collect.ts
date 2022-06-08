import { ok, err, combine } from './shared-kernel'
import * as db from './db'
import type { Resource, ResourceNode } from './domain/resource'
import type { RoutesConfig, DataQueryBrowse } from './domain/routes'
import { getCollections, getRoutes } from './domain/routes'
import {
  createResource as createInternalResource,
  createDynamicVariables,
} from './domain/resource'
import { createPost } from './domain/post'
import { createPage } from './domain/page'
import { createAuthor } from './domain/author'
import { createTag } from './domain/tag'
import type { ResultAsync } from './shared-kernel'
import * as api from './api'
import { makeNqlFilter, compilePermalink } from './helpers'
import { do_, absurd } from './shared/utils'
import { createLogger } from './logger'

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

function createUrlPathname(
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

function createResource(
  routesConfig: RoutesConfig,
  resourceNode: ResourceNode
) {
  const urlPathname = createUrlPathname(routesConfig, resourceNode)
  if (urlPathname.isErr()) {
    return err(urlPathname.error)
  }

  const { __typename } = resourceNode
  switch (__typename) {
    case 'Post': {
      const resourceResult = createInternalResource(
        resourceNode,
        urlPathname.value
      )
      if (resourceResult.isErr()) {
        return err(resourceResult.error)
      }

      const entryResult = createPost(resourceNode)
      if (entryResult.isErr()) {
        return err(entryResult.error)
      }
      return ok({
        type: 'post' as const,
        resource: resourceResult.value,
        entry: entryResult.value,
      })
    }
    case 'Page': {
      const resourceResult = createInternalResource(
        resourceNode,
        urlPathname.value
      )
      if (resourceResult.isErr()) {
        return err(resourceResult.error)
      }
      const entryResult = createPage(resourceNode)
      if (entryResult.isErr()) {
        return err(entryResult.error)
      }
      return ok({
        type: 'page' as const,
        resource: resourceResult.value,
        entry: entryResult.value,
      })
    }
    case 'Author': {
      const resourceResult = createInternalResource(
        resourceNode,
        urlPathname.value
      )
      if (resourceResult.isErr()) {
        return err(resourceResult.error)
      }
      const entryResult = createAuthor(resourceNode)
      if (entryResult.isErr()) {
        return err(entryResult.error)
      }
      return ok({
        type: 'author' as const,
        resource: resourceResult.value,
        entry: entryResult.value,
      })
    }
    case 'Tag': {
      const resourceResult = createInternalResource(
        resourceNode,
        urlPathname.value
      )
      if (resourceResult.isErr()) {
        return err(resourceResult.error)
      }
      const entryResult = createTag(resourceNode)
      if (entryResult.isErr()) {
        return err(entryResult.error)
      }
      return ok({
        type: 'tag' as const,
        resource: resourceResult.value,
        entry: entryResult.value,
      })
    }
    case 'Config': {
      const resourceResult = createInternalResource(
        resourceNode,
        urlPathname.value
      )
      if (resourceResult.isErr()) {
        return err(resourceResult.error)
      }
      return ok({
        type: 'config' as const,
        resource: resourceResult.value,
      })
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
        ReturnType<typeof createResource>[]
      >((acc, current) => {
        const resourceItem = createResource(routesConfig, current)

        if (resourceItem.isErr()) {
          acc.push(err(resourceItem.error))
          return acc
        }

        acc.push(resourceItem)

        return acc
      }, [])

      return combine(resourceResultList).andThen((resources) => {
        const collectionFilters = [
          ...resources.flatMap(({ resource }) => {
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
        ]

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
            post: collectionFilters,
            page: [],
            author: [],
            tag: [],
          }
        )

        return combine(
          resources.flatMap((resourceItem) => {
            // TODO refactor to remove this douple check
            if (resourceItem.type === 'config' || resourceItem.resource.resourceType === 'config') {
              return ok(resourceItem.resource)
            }

            // calculate matching filters
            const matchingFilter = do_(() => {
              return resourceFilters[resourceItem.type].filter(
                (routeFilter) => {
                  const nqlFilter = makeNqlFilter(routeFilter)
                  const nqlFilterResult = nqlFilter(resourceItem.entry)
                  if (nqlFilterResult.isErr()) {
                    return false
                  }
                  return nqlFilterResult.value
                }
              )
            })

            let urlPathname = resourceItem.resource.urlPathname

            if (
              resourceItem.type === 'post' &&
              resourceItem.resource.resourceType === 'post'
            ) {
              const { resource, entry } = resourceItem
              // find owning collection
              const collectionRouteConfig = getCollections(routesConfig).find(
                ([_, collection]) => {
                  const nqlFilter = collection.filter
                    ? makeNqlFilter(collection.filter)
                    : () => ok(true)

                  const nqlFilterResult = nqlFilter(entry)
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
                urlPathname = permalinkResult.value
              }
            }

            return ok({
              ...resourceItem.resource,
              urlPathname,
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
