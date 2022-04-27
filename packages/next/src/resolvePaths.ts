import path from 'path'
import { ok, err, combine } from './shared-kernel'
import type { RoutingConfigResolved, DataQueryBrowse } from './domain/routes'
import type { Resource } from './domain/resource'
import type { Entries, Result } from './shared-kernel'
import type { Taxonomies } from './domain/taxonomy'
import repository from './repository'
import { compilePermalink } from './helpers'
import { processQuery } from './helpers/processQuery'

const POST_PER_PAGE = 5

export async function processQueryComplete(query: DataQueryBrowse) {
  let stopped = false
  let page = query.page

  const resourcesResult: Result<Resource>[] = []

  while (!stopped) {
    // eslint-disable-next-line no-await-in-loop
    const queryOutcomeBrowseResult = await processQuery({
      ...query,
      page,
    })
    if (queryOutcomeBrowseResult.isOk()) {
      const {
        value: { resources, pagination },
      } = queryOutcomeBrowseResult

      resourcesResult.push(...resources.map((resource) => ok(resource)))

      page = pagination.next
      if (!pagination.next) {
        stopped = true
      }
    } else {
      resourcesResult.push(err(queryOutcomeBrowseResult.error))
      stopped = true
    }
  }

  return combine(resourcesResult)
}

async function resolveRoutesPaths(routingConfig: RoutingConfigResolved) {
  const routes = Object.entries(routingConfig.routes ?? {}) as Entries<
    typeof routingConfig.routes
  >

  const result = await Promise.all(
    routes.map(async ([mainRoute, config]) => {
      if ('controller' in config && config.controller === 'channel') {
        const collectionPostsQuery = {
          type: 'browse',
          resourceType: 'post',
          filter: config.filter,
          limit: config.limit,
          order: config.order,
        } as const

        return (await processQueryComplete(collectionPostsQuery)).map(
          (resources) => {
            return [
              mainRoute,
              ...Array.from(
                {
                  length: Math.floor(resources.length / POST_PER_PAGE),
                },
                (_, i) => path.join(mainRoute, 'page', String(i + 1))
              ),
            ]
          }
        )
      }
      return ok([mainRoute])
    })
  )

  return combine(result)
}

async function resolveCollectionsPaths(routingConfig: RoutingConfigResolved) {
  const collections = Object.entries(
    routingConfig.collections ?? {}
  ) as Entries<typeof routingConfig.collections>

  const postSet = new Set()

  const result = await Promise.all(
    collections.map(async ([mainRoute, config]) => {
      const collectionPostsQuery = {
        type: 'browse',
        resourceType: 'post',
        filter: config.filter,
        limit: config.limit,
        order: config.order,
      } as const

      return (await processQueryComplete(collectionPostsQuery)).andThen(
        (resources) => {
          const paths: Result<string>[] = [ok(mainRoute)]

          resources.forEach((resource) => {
            if (!postSet.has(resource.id)) {
              postSet.add(resource.id)
              paths.push(compilePermalink(config.permalink, resource))
            }
          })

          Array.from({ length: resources.length / POST_PER_PAGE }, (_, i) => {
            return paths.push(ok(path.join(mainRoute, 'page', String(i + 1))))
          })

          return combine(paths)
        }
      )
    })
  )

  return combine(result)
}

export function resolveTaxonomiesPaths(routingConfig: RoutingConfigResolved) {
  const taxonomies = Object.entries(routingConfig.taxonomies ?? {}) as Entries<
    typeof routingConfig.taxonomies
  >

  const result = taxonomies.map(
    ([key, permalink]: [Taxonomies, string | undefined]) => {
      return repository.findAll(key).andThen((taxonomyResources) => {
        return combine(
          taxonomyResources.flatMap((taxonomy) => {
            return [
              compilePermalink(permalink!, taxonomy),
              ...Array.from(
                { length: taxonomyResources.length / POST_PER_PAGE },
                (_, i) => {
                  return ok(path.join(permalink!, 'page', String(i + 1)))
                }
              ),
            ]
          })
        )
      })
    }
  )

  return combine(result)
}

export function resolvePagesPaths() {
  return repository.findAll('page').map((pages) => {
    return pages.map((resource) => {
      return `/${resource.slug}`
    })
  })
}

export default async function resolvePaths(
  routingConfig: RoutingConfigResolved
) {
  const pathsResultList = [
    ok(['/admin']),
    await resolveRoutesPaths(routingConfig),
    await resolveCollectionsPaths(routingConfig),
    await resolvePagesPaths(),
    await resolveTaxonomiesPaths(routingConfig),
  ]

  return combine(pathsResultList).map((paths) => {
    return paths.flat(2)
  })
}
