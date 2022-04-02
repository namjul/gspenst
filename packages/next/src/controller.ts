import type { Redirect } from 'next'
import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import type { RoutingProperties } from './routing'
// import { resourceCacheMap } from './plugin'
import { assertUnreachable } from './helpers';
import { getTemplateHierarchy } from './dataUtils';

const client = ExperimentalGetTinaClient() // eslint-disable-line new-cap

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
        prev: number // the previous page number
        next: number // the next page number
        pages: number // the number of pages available
        total: number // the number of posts available
        limit: number // the number of posts per page
      }
    }

async function entryController(
  routingProperties: Extract<RoutingProperties, { type: 'entry' }>
): Promise<PageProps> {
  const {
    resourceItem: { resource, relativePath, resource: context },
  } = routingProperties

  const data = await (async () => {
    switch (resource) {
      case 'page':
        return client.getPage({ relativePath })
      case 'post':
        return client.getPost({ relativePath })
      case 'author':
        return client.getAuthor({ relativePath })
      case 'tag':
        // TODO
        throw new Error('needs to be implemented')
      default:
        return assertUnreachable(resource)
    }
  })() // Immediately invoke the function

  return {
    context,
    data: {
      [resource]: data
    },
    templates: getTemplateHierarchy(routingProperties)
  }
}

export async function controller(routingProperties: RoutingProperties): Promise<{ props: PageProps } | { redirect: Redirect } | null> {
  if (!routingProperties) {
    return null
  }

  const { type } = routingProperties
  switch (type) {
    case 'collection':
      return null
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

// async get(ids: ID | ID[]): Promise<Array<ResourceItem & { data: any }>> {
//   const resources = await this.cache.get()
//   return Promise.all(
//     toArray(ids).map(async (id) => {
//       const resourceItem = resources[id]
//
//       if (!resourceItem) {
//         throw new Error('Missing Resource')
//       }
//
//       if (!resourceItem.data) {
//         let data
//
//         switch (resourceItem.resource) {
//           case 'page':
//             data = client.getPage({ relativePath: resourceItem.relativePath })
//             break
//           default:
//         }
//
//         await this.cache.set({
//           ...resources,
//           [id]: { ...resourceItem, data },
//         })
//
//         return {
//           ...resourceItem,
//           data,
//         }
//       }
//
//       return resourceItem as ResourceItem & { data: any }
//     })
//   )
//
// }

// getCollection(

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
