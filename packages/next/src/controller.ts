import type { Redirect } from 'next'
import type { RoutingProperties } from './routing'
import { assertUnreachable } from './helpers'
import { getTemplateHierarchy } from './dataUtils'
import repository from './repository'
import { ensure } from './utils'

export type PageProps =
  | {
      context: 'post' | 'page' | 'tag' | 'author'
      data: {
        [name: string]: unknown
      }
      templates: string[]
    }
  | {
      context: 'index'
      data: {
        [name: string]: unknown
      }
      templates: string[]
      pagination: {
        page: number // the current page number
        prev: number | null // the previous page number
        next: number | null // the next page number
        pages: number // the number of pages available
        total: number // the number of posts available
        limit: number // the number of posts per page
      }
    }

async function entryController(
  routingProperties: Extract<RoutingProperties, { type: 'entry' }>
): Promise<PageProps> {
  const resourceID = routingProperties.resourceItem.id
  const resources = await repository.get(resourceID)
  const resourceItem = resources[resourceID]
  ensure(resourceItem)
  const { resource } = resourceItem

  return {
    context: resource,
    data: {
      [resource]: resourceItem.data,
    },
    templates: getTemplateHierarchy(routingProperties),
  }
}

async function collectionController(
  routingProperties: Extract<RoutingProperties, { type: 'collection' }>
): Promise<PageProps> {
  return {
    context: 'index',
    templates: getTemplateHierarchy(routingProperties),
    data: {
      posts: {},
    },
    pagination: {
      page: 1,
      prev: null,
      next: null,
      pages: 1,
      total: 10,
      limit: 10,
    },
  }
}

export async function controller(
  routingProperties: RoutingProperties
): Promise<{ props: PageProps } | { redirect: Redirect } | null> {
  if (!routingProperties) {
    return null
  }

  const { type } = routingProperties
  switch (type) {
    case 'collection':
      return {
        props: await collectionController(routingProperties),
      }
    case 'channel':
      return null
    case 'entry':
      return {
        props: await entryController(routingProperties),
      }
    case 'custom':
      return null
    case 'redirect':
      return {
        redirect: routingProperties,
      }

    default:
      return assertUnreachable(type)
  }
}

// getList(
//   resource: Resource,
//   filter: string,
//   order: string,
//   limit: string,
//   remember: boolean = false
// ) {
//   // 1. get remember/non-rememberd resources from cache
//   // 2. filter
//   // 3. order
//   // 4. limit
//   // 5. remember
//   // 6. map through `this.map()` or fetch resource-collection(with filter applied https://github.com/tinacms/tinacms/pull/2618) and filter there
// }
//
// clear() {
//   // 1. clear cache
//   // 2. clear remember cache
// }
