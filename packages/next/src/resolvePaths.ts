import path from 'path'
import { ok, err, okAsync, combine } from './shared-kernel'
import type { RoutingConfigResolved } from './domain/routes'
import type { Entries, Result } from './shared-kernel'
import type { Resource } from './domain/resource'
import type { Taxonomies } from './domain/taxonomy'
import repository from './repository'
import { filterResource } from './helpers/filterResource'
import { compilePermalink } from './helpers'

const POST_PER_PAGE = 5

function resolveRoutesPaths(routingConfig: RoutingConfigResolved) {
  const routes = Object.entries(routingConfig.routes ?? {}) as Entries<
    typeof routingConfig.routes
  >

  const result = routes.map(([mainRoute, config]) => {
    if ('controller' in config && config.controller === 'channel') {
      return repository
        .findAll('post')
        .andThen((resources) => {
          return combine(
            resources.flatMap((resource) => {
              const filterResourceResult = filterResource(
                resource,
                config.filter
              )
              if (
                (filterResourceResult.isOk() &&
                  filterResourceResult.value.owned) ||
                filterResourceResult.isErr()
              ) {
                return filterResourceResult
              }
              return []
            })
          )
        })
        .map((filteredResources) => {
          return [
            mainRoute,
            ...Array.from(
              {
                length: Math.floor(filteredResources.length / POST_PER_PAGE),
              },
              (_, i) => path.join(mainRoute, 'page', String(i + 1))
            ),
          ]
        })
    }
    return okAsync(mainRoute)
  })

  return combine(result)
}

function resolveCollectionsPaths(routingConfig: RoutingConfigResolved) {
  const postStackResult = repository.findAll('post')

  const collections = Object.entries(
    routingConfig.collections ?? {}
  ) as Entries<typeof routingConfig.collections>

  const result = collections.map(([mainRoute, config]) => {
    return postStackResult.andThen((postStack) => {
      const paths: Result<string>[] = [ok(mainRoute)]

      const collectionPosts: Resource[] = []
      for (let len = postStack.length - 1; len >= 0; len -= 1) {
        const resource = postStack[len]
        if (resource) {
          const filterResourceResult = filterResource(resource, config.filter)

          if (filterResourceResult.isErr()) {
            paths.push(err(filterResourceResult.error))
          } else if (filterResourceResult.value.owned) {
            collectionPosts.push(resource)
            paths.push(
              compilePermalink(
                config.permalink,
                filterResourceResult.value.resource
              )
            )
            // Remove owned resource
            postStack.splice(len, 1)
          }
        }
      }

      Array.from(
        { length: Math.floor(collectionPosts.length / POST_PER_PAGE) },
        (_, i) => {
          return paths.push(ok(path.join(mainRoute, 'page', String(i + 1))))
        }
      )

      return combine(paths)
    })
  })

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
  const paths = [
    okAsync(['/admin']),
    resolveRoutesPaths(routingConfig),
    resolveCollectionsPaths(routingConfig),
    resolvePagesPaths(),
    resolveTaxonomiesPaths(routingConfig),
  ]

  return combine(paths).map((x) => x.flat(2))
}
