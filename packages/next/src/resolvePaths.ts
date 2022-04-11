import path from 'path'
import { compile } from 'path-to-regexp'
import type { RoutingConfigResolved } from './validate'
import type { ResourceItem, Entries } from './types'
import repository from './repository'

const POST_PER_PAGE = 5

function resolveRoutesPaths(routingConfig: RoutingConfigResolved) {
  return Object.keys(routingConfig.routes ?? {})
}

async function resolveCollectionsPaths(routingConfig: RoutingConfigResolved) {
  const postStack = Object.values(await repository.getAll('post'))

  return Object.entries(routingConfig.collections ?? {}).reduce<string[]>(
    (acc, [mainRoute, config]) => {
      acc.push(mainRoute)

      const collectionPosts: ResourceItem[] = []
      for (let len = postStack.length - 1; len >= 0; len -= 1) {
        const resourceItem = postStack[len]
        if (resourceItem) {
          collectionPosts.push(resourceItem)
          const isOwned = true // TODO filter using filter option `const isOwned = this.nql.queryJSON(resource)`
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (isOwned) {
            acc.push(compile(config.permalink)(resourceItem))

            // Remove owned resourceItem
            postStack.splice(len, 1)
          }
        }
      }

      Array.from({ length: collectionPosts.length / POST_PER_PAGE }, (_, i) => {
        return acc.push(path.join(mainRoute, 'page', String(i + 1)))
      })

      return acc
    },
    []
  )
}

export async function resolveTaxonomiesPaths(
  routingConfig: RoutingConfigResolved
) {
  const taxonomies = Object.entries(routingConfig.taxonomies ?? {}) as Entries<
    typeof routingConfig.taxonomies
  >

  return taxonomies.reduce<Promise<string[]>>(
    async (promise, [key, permalink]) => {
      const acc = await promise

      if (permalink) {
        const taxonomyEntries = await repository.getAll(key)
        Object.values(taxonomyEntries).forEach((taxonomy) => {
          acc.push(compile(permalink)(taxonomy))
        })
      }

      return Promise.resolve(acc)
    },
    Promise.resolve([])
  )
}

export async function resolvePagesPaths() {
  const pages = await repository.getAll('page')

  return Object.values(pages).reduce<string[]>((acc, resourceItem) => {
    acc.push(`/${resourceItem.slug}`)
    return acc
  }, [])
}

export default async function resolvePaths(
  routingConfig: RoutingConfigResolved
) {
  const paths = [
    '/admin',
    ...resolveRoutesPaths(routingConfig),
    ...(await resolveCollectionsPaths(routingConfig)),
    ...(await resolvePagesPaths()),
    ...(await resolveTaxonomiesPaths(routingConfig)),
  ]

  return paths
}
