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
} from './types'

type Pagination = {
  page: number // the current page number
  prev: number | null // the previous page number
  next: number | null // the next page number
  pages: number // the number of pages available
  total: number // the number of posts available
  limit: number // the number of posts per page
}

type BasePageProps = {
  templates: string[]
  data: {
    [name: string]: unknown
  }
}

type PostPageProps = BasePageProps & {
  context: Extract<ContextType, 'post'>
  data: {
    post: PostResult
  }
}

type PagePageProps = BasePageProps & {
  context: Extract<ContextType, 'page'>
  data: {
    page: PageResult
  }
}

type AuthorPageProps = BasePageProps & {
  context: Extract<ContextType, 'author'>
  data: {
    author: AuthorResult
  }
}

type TagPageProps = BasePageProps & {
  context: Extract<ContextType, 'tag'>
  data: {
    tag: TagResult
  }
}

type IndexPageProps = BasePageProps & {
  context: Extract<ContextType, 'index' | 'home' | 'paged'>
  data: {
    posts: PostResult[]
  }
  pagination: Pagination
}

export type PageProps =
  | IndexPageProps
  | TagPageProps
  | AuthorPageProps
  | PagePageProps
  | PostPageProps

async function entryController(
  routingProperties: Extract<RoutingProperties, { type: 'entry' }>
): Promise<PageProps> {
  const resourceID = routingProperties.resourceItem.id
  const resources = await repository.get(resourceID)
  const resourceItem = resources[resourceID]
  ensure(resourceItem)
  const { resourceType, data } = resourceItem

  let headers = {}

  if (data && 'getPostDocument' in data.data) {
    headers = getHeaders(data.data.getPostDocument.data.body as Root)
  }
  if (data && 'getPageDocument' in data.data) {
    headers = getHeaders(data.data.getPageDocument.data.body as Root)
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
  const posts = Object.values(await repository.getAll()).flatMap((resource) => {
    return resource.resourceType === 'post'
      ? resource.data
        ? [resource.data]
        : []
      : []
  })

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
