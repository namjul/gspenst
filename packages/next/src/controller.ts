import type { Redirect } from 'next'
import type { RoutingProperties } from './routing'
import { assertUnreachable } from './helpers'
import { getTemplateHierarchy } from './dataUtils'
import getHeaders from './getHeaders'
import repository from './repository'
import { ensure } from './utils'
import type {
  ContextType,
  Root,
  AsyncReturnType,
  PostResult,
  PageResult,
  TagResult,
  AuthorResult,
  ConfigResult,
} from './types'

type Pagination = {
  page: number // the current page number
  prev: number | null // the previous page number
  next: number | null // the next page number
  pages: number // the number of pages available
  total: number // the number of posts available
  limit: number // the number of posts per page
}

type PageProps = {
  context: ContextType
  templates: string[]
  data: {
    entry:
      | PostResult
      | PageResult
      | AuthorResult
      | TagResult
      | ConfigResult
      | undefined
    headers?: ReturnType<typeof getHeaders> | undefined
    [name: string]: unknown
  }
  pagination?: Pagination
}

// type BasePageProps = {
//   templates: string[]
//   data: {
//     headers?: ReturnType<typeof getHeaders> | undefined
//     [name: string]: unknown
//   }
// }
//
// type PostPageProps = BasePageProps & {
//   context: Extract<ContextType, 'post'>
//   data: {
//     entry: PostResult
//   }
// }
//
// type PagePageProps = BasePageProps & {
//   context: Extract<ContextType, 'page'>
//   data: {
//     entry: PageResult
//   }
// }
//
// type AuthorPageProps = BasePageProps & {
//   context: Extract<ContextType, 'author'>
//   data: {
//     entry: AuthorResult
//   }
// }
//
// type TagPageProps = BasePageProps & {
//   context: Extract<ContextType, 'tag'>
//   data: {
//     entry: TagResult
//   }
// }
//
// type IndexPageProps = BasePageProps & {
//   context: Extract<ContextType, 'index' | 'home' | 'paged'>
//   data: {
//     entry: ConfigResult
//     posts: PostResult[]
//   }
//   pagination: Pagination
// }
//
// type CustomPageProps = BasePageProps & {
//   context: null
// }
//
// export type PageProps =
//   | IndexPageProps
//   | TagPageProps
//   | AuthorPageProps
//   | PagePageProps
//   | PostPageProps
//   | CustomPageProps
//   | null

async function entryController(
  routingProperties: Extract<RoutingProperties, { type: 'entry' }>
): Promise<PageProps> {
  const resourceID = routingProperties.resourceItem.id
  const resources = await repository.get(resourceID)
  const resourceItem = resources[resourceID]
  ensure(resourceItem)
  const { resourceType, data } = resourceItem

  if (resourceType === 'config') {
    throw new Error('Should not load config resource.')
  }

  const headers =
    data &&
    (() => {
      if ('getPostDocument' in data.data) {
        return getHeaders(data.data.getPostDocument.data.body as Root)
      }
      if ('getPageDocument' in data.data) {
        return getHeaders(data.data.getPageDocument.data.body as Root)
      }
    })() // Immediately invoke the function

  return {
    context: resourceType,
    data: {
      entry: data,
      headers,
    },
    templates: getTemplateHierarchy(routingProperties),
  }
}

async function collectionController(
  routingProperties: Extract<RoutingProperties, { type: 'collection' }>
): Promise<PageProps> {
  const resources = await repository.getAll()
  const posts = Object.values(resources).flatMap((resource) => {
    return resource.resourceType === 'post'
      ? resource.data
        ? [resource.data]
        : []
      : []
  })
  const entry = resources['content/config/index.json']?.data

  return {
    context: 'index',
    templates: getTemplateHierarchy(routingProperties),
    data: {
      entry,
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
    data: {
      entry: undefined,
    },
  }
}

export type ControllerReturnType = Exclude<
  AsyncReturnType<typeof controller>,
  null
>

export async function controller(
  routingProperties: RoutingProperties
): Promise<
  | { type: 'props'; props: PageProps }
  | { type: 'redirect'; redirect: Redirect }
  | null
> {
  if (!routingProperties) {
    return null
  }

  const { type } = routingProperties

  switch (type) {
    case 'collection':
      return {
        type: 'props',
        props: await collectionController(routingProperties),
      }
    case 'channel':
      return null
    case 'entry':
      return {
        type: 'props',
        props: await entryController(routingProperties),
      }
    case 'custom':
      return {
        type: 'props',
        props: await customController(routingProperties),
      }
    case 'redirect':
      return {
        type: 'redirect',
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
