import type { Redirect } from 'next'
import type { RoutingProperties } from './routing'
import { assertUnreachable } from './helpers'
import { getTemplateHierarchy } from './dataUtils'
import getHeaders from './getHeaders'
import repository from './repository'
import { ensure } from './utils'
import type { ContextType, Root } from './types'

export type PageProps =
  | {
      context: Extract<ContextType, 'post' | 'page' | 'tag' | 'author'> | null
      data: {
        [name: string]: unknown
      }
      templates: string[]
    }
  | {
      context: Extract<ContextType, 'index' | 'home' | 'paged'>
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
  const { resourceType, data } = resourceItem

  let headers = {}

  if (data && 'getPostDocument' in data) {
    headers = getHeaders(data.getPostDocument.data.body as Root)
  }
  if (data && 'getPageDocument' in data) {
    headers = getHeaders(data.getPageDocument.data.body as Root)
  }

  return {
    context: resourceType,
    data: {
      [resourceType]: data,
      headers,
    },
    templates: getTemplateHierarchy(routingProperties),
  }
}

async function collectionController(
  routingProperties: Extract<RoutingProperties, { type: 'collection' }>
): Promise<PageProps> {
  const posts = Object.values(await repository.getAll()).filter(
    (resource) => resource.resourceType === 'post'
  )
  return {
    context: 'index',
    templates: getTemplateHierarchy(routingProperties),
    data: {
      posts,
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

async function customController(
  routingProperties: Extract<RoutingProperties, { type: 'custom' }>
): Promise<PageProps> {
  return {
    context: null,
    templates: getTemplateHierarchy(routingProperties),
    data: {},
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
      return {
        props: await customController(routingProperties),
      }
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
