import { ok, err, combine } from './shared-kernel'
import * as db from './db'
import type { Resource } from './domain/resource'
import type { RoutesConfig, DataQueryBrowse } from './domain/routes'
import { getCollections, getRoutes } from './domain/routes'
import { createResource, createDynamicVariables } from './domain/resource'
import { createPost } from './domain/post'
import { createPage } from './domain/page'
import { createAuthor } from './domain/author'
import { createTag } from './domain/tag'
import type { Post } from './domain/post'
import type { Page } from './domain/page'
import type { Author } from './domain/author'
import type { Tag } from './domain/tag'
import type { Result, ResultAsync } from './shared-kernel'
import * as api from './api'
import { makeNqlFilter, compilePermalink } from './helpers'
import { do_ } from './shared/utils'
import { createLogger } from './logger'

const log = createLogger('collect')

export function collect(
  routesConfig: RoutesConfig = {}
): ResultAsync<Resource[]> {
  log('start')
  const result = combine([db.clear(), api.getResources()])
    .map((results) => {
      return results.flatMap((collectionResources) => {
        if (collectionResources === 'OK') {
          return []
        }
        return collectionResources.data.collections.flatMap((collection) => {
          return (collection.documents.edges ?? []).flatMap(
            (collectionEdge) => {
              if (collectionEdge?.node) {
                return collectionEdge.node.__typename === 'Config'
                  ? []
                  : collectionEdge.node
              }
              return []
            }
          )
        })
      })
    })
    .andThen((nodes) => {
      const resourceResultList = nodes.reduce<
        Result<
          | {
              type: Extract<Resource['resourceType'], 'post'>
              resource: Resource
              entry: Post
            }
          | {
              type: Extract<Resource['resourceType'], 'page'>
              resource: Resource
              entry: Page
            }
          | {
              type: Extract<Resource['resourceType'], 'author'>
              resource: Resource
              entry: Author
            }
          | {
              type: Extract<Resource['resourceType'], 'tag'>
              resource: Resource
              entry: Tag
            }
        >[]
      >((acc, current) => {
        const dynamicVariablesResult = createDynamicVariables(current)
        if (dynamicVariablesResult.isErr()) {
          acc.push(err(dynamicVariablesResult.error))
          return acc
        }

        const urlPathname = do_(() => {
          if (current.__typename === 'Page') {
            return `/${dynamicVariablesResult.value.slug}`
          }
          const taxonomyEntry =
            current.__typename === 'Author'
              ? routesConfig.taxonomies?.author
              : routesConfig.taxonomies?.tag
          if (taxonomyEntry) {
            const permalinkResult = compilePermalink(
              taxonomyEntry.permalink,
              dynamicVariablesResult.value
            )
            if (permalinkResult.isErr()) {
              acc.push(err(permalinkResult.error))
            } else {
              return permalinkResult.value
            }
          }
          return undefined
        })

        const resourceItem = do_(() => {
          if (current.__typename === 'Post') {
            const entryResult = createPost(current)
            if (entryResult.isErr()) {
              return err(entryResult.error)
            }
            const resourceResult = createResource(current, urlPathname)
            if (resourceResult.isErr()) {
              return err(resourceResult.error)
            }
            return ok({
              type: 'post' as const,
              resource: resourceResult.value,
              entry: entryResult.value,
            })
          } else if (current.__typename === 'Page') {
            const entryResult = createPage({ content: '', ...current })
            if (entryResult.isErr()) {
              return err(entryResult.error)
            }
            const resourceResult = createResource(current, urlPathname)
            if (resourceResult.isErr()) {
              return err(resourceResult.error)
            }
            return ok({
              type: 'page' as const,
              resource: resourceResult.value,
              entry: entryResult.value,
            })
          } else if (current.__typename === 'Author') {
            const entryResult = createAuthor(current)
            if (entryResult.isErr()) {
              return err(entryResult.error)
            }
            const resourceResult = createResource(current, urlPathname)
            if (resourceResult.isErr()) {
              return err(resourceResult.error)
            }
            return ok({
              type: 'author' as const,
              resource: resourceResult.value,
              entry: entryResult.value,
            })
          } else {
            const entryResult = createTag(current)
            if (entryResult.isErr()) {
              return err(entryResult.error)
            }
            const resourceResult = createResource(current, urlPathname)
            if (resourceResult.isErr()) {
              return err(resourceResult.error)
            }
            return ok({
              type: 'tag' as const,
              resource: resourceResult.value,
              entry: entryResult.value,
            })
          }
        })

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

        const z = [
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
          resources.flatMap(({ resource, entry }) => {
            // calculate matching filters
            const matchingFilter = z[resource.resourceType].filter(
              (routeFilter) => {
                const nqlFilter = makeNqlFilter(routeFilter)
                const nqlFilterResult = nqlFilter(entry)
                if (nqlFilterResult.isErr()) {
                  return false
                }
                return nqlFilterResult.value
              }
            )

            let urlPathname = resource.urlPathname

            if (resource.resourceType === 'post') {
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
              ...resource,
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
