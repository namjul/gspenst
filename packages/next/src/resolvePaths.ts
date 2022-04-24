import path from 'path'
import { ok, err, combine } from './shared-kernel'
import type { RoutingConfigResolved } from './domain/routes'
import type { Entries, Result } from './shared-kernel'
import type { Resource } from './domain/resource'
import type { Taxonomies } from './domain/taxonomy'
import repository from './repository'
import { filterResource } from './helpers/filterResource'
import { compilePermalink } from './helpers'

const POST_PER_PAGE = 5

function resolveRoutesPaths(routingConfig: RoutingConfigResolved) {
  return Object.keys(routingConfig.routes ?? {}).map(ok)
}

async function resolveCollectionsPaths(routingConfig: RoutingConfigResolved) {
  const postStackResult = await repository.findAll('post')

  if (postStackResult.isOk()) {
    const collections = Object.entries(
      routingConfig.collections ?? {}
    ) as Entries<typeof routingConfig.collections>

    const result = await Promise.all(
      collections.flatMap(([mainRoute, config]) => {
        const paths: Result<string>[] = [ok(String(mainRoute))]
        const postStack = postStackResult.value

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
            return paths.push(
              ok(path.join(String(mainRoute), 'page', String(i + 1)))
            )
          }
        )

        return paths
      })
    )
    return result
  }

  return [err(postStackResult.error)]
}

export async function resolveTaxonomiesPaths(
  routingConfig: RoutingConfigResolved
) {
  const taxonomies = Object.entries(routingConfig.taxonomies ?? {}) as Entries<
    typeof routingConfig.taxonomies
  >

  return (
    await Promise.all(
      taxonomies.map(
        async ([key, permalink]: [Taxonomies, string | undefined]) => {
          const taxonomiesResult = await repository.findAll(key)
          if (taxonomiesResult.isOk()) {
            return taxonomiesResult.value.flatMap((taxonomy) => {
              return [
                compilePermalink(permalink!, taxonomy),
                ...Array.from(
                  { length: taxonomiesResult.value.length / POST_PER_PAGE },
                  (_, i) => {
                    return ok(path.join(permalink!, 'page', String(i + 1)))
                  }
                ),
              ]
            })
          }
          return [err(taxonomiesResult.error)]
        }
      )
    )
  ).flat()
}

export async function resolvePagesPaths() {
  const pages = await repository.findAll('page')
  if (pages.isOk()) {
    return pages.value.map((resource) => {
      return ok(`/${resource.slug}`)
    })
  }
  return [err(pages.error)]
}

export default async function resolvePaths(
  routingConfig: RoutingConfigResolved
) {
  const paths = [
    ok('/admin'),
    ...resolveRoutesPaths(routingConfig),
    ...(await resolveCollectionsPaths(routingConfig)),
    ...(await resolvePagesPaths()),
    ...(await resolveTaxonomiesPaths(routingConfig)),
  ]

  return combine(paths)
}
