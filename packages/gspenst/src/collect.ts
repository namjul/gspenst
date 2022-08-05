import { ok, err, combine, idSchema } from './shared/kernel'
import type { ResultAsync, Result } from './shared/kernel'
import * as db from './db'
import type { Resource } from './domain/resource'
import type { RoutesConfig, DataQueryBrowse } from './domain/routes'
import { getCollections, getRoutes } from './domain/routes'
import { createResource } from './domain/resource'
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
import { parse } from './helpers/parser'

const log = createLogger('collect')

export function collect(
  routesConfig: RoutesConfig = {}
): ResultAsync<Resource[]> {
  log('start')
  // TODO make configurable so that only a single resource node can be collected
  const result = combine([
    db.clear(),
    api.getConfig(),
    api.getTags(),
    api.getAuthors(),
    api.getPosts(),
    api.getPages(),
  ])
    .andThen((resourceNodes) => {
      const resourceResultList = resourceNodes
        .flat()
        .reduce<Result<Resource>[]>((acc, current) => {
          if (current === 'OK') {
            return acc
          }
          const resourceItem = createResource(current).andThen((resource) => {
            // TODO maybe use router to handle path
            const { type } = resource
            switch (type) {
              case 'page': {
                const { breadcrumbs } = resource
                const nestedPath = breadcrumbs.slice(0, -1)
                resource.path = `/${
                  nestedPath.length ? `${nestedPath.join('/')}/` : ''
                }${resource.slug}`
                return ok(resource)
              }
              case 'author':
              case 'tag': {
                const taxonomyEntry = routesConfig.taxonomies?.[type]
                if (taxonomyEntry) {
                  return compilePermalink(
                    taxonomyEntry.permalink,
                    resource
                  ).map((permalink) => ({
                    ...resource,
                    path: permalink,
                  }))
                }
              }
              // eslint-disable-next-line no-fallthrough
              case 'config': {
                return ok(resource)
              }
              default:
                return parse(idSchema, resource.id).map((id) => ({
                  ...resource,
                  path: `/${id}`,
                }))
            }
          })

          acc.push(resourceItem)

          return acc
        }, [])

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
                if (resource.type === 'tag' || resource.type === 'author') {
                  const taxonomyRoute = routesConfig.taxonomies?.[resource.type]
                  return taxonomyRoute
                    ? {
                        controller: 'channel' as const,
                        filter: taxonomyRoute.filter.replace(
                          /%s/g,
                          resource.slug
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

        return combine(
          resources.flatMap((resource) => {
            if (resource.type === 'config') {
              return ok(resource)
            }

            const entryResult = do_(() => {
              const { type } = resource

              switch (type) {
                case 'post': {
                  return createPost(resource.tinaData.data.post)
                }
                case 'page': {
                  return createPage(resource.tinaData.data.page)
                }
                case 'author': {
                  return createAuthor(resource.tinaData.data.author)
                }
                case 'tag': {
                  return createTag(resource.tinaData.data.tag)
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
                ...resourcesFilters[resource.type],
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
            if (resource.type === 'post') {
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
