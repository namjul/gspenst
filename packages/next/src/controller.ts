import { ok, err } from 'neverthrow'
import type { Redirect } from 'next'
import type { RoutingContext } from './routing'
import { assertUnreachable } from './helpers'
import { getTemplateHierarchy } from './dataUtils'
import repository from './repository'
import type {
  ContextType,
  AsyncReturnType,
  Result,
  Simplify,
  ConfigResourceItem,
} from './types'
import type { GetPage, GetPost, GetTag, GetAuthor, GetConfig } from './api'
import * as Errors from './errors'

type Pagination = {
  page: number // the current page number
  prev: number | null // the previous page number
  next: number | null // the next page number
  pages: number // the number of pages available
  total: number // the number of posts available
  limit: number // the number of posts per page
}

// export type PageProps =
//   | {
//       context: ContextType
//       templates: string[]
//       data: {
//         entry: GetPost | GetPage | GetAuthor | GetTag | GetConfig
//         [name: string]: unknown
//       }
//       pagination?: Pagination
//       route: string
//     }
//   | { context: 'internal' }

type BasePageProps = {
  templates: string[]
  data: {
    [name: string]: unknown
  }
  route: string
}

type PostPageProps = Simplify<
  BasePageProps & {
    context: Extract<ContextType, 'post'>
    data: {
      entry: GetPost
    }
  }
>

type PagePageProps = Simplify<
  BasePageProps & {
    context: Extract<ContextType, 'page'>
    data: {
      entry: GetPage
    }
  }
>

type AuthorPageProps = Simplify<
  BasePageProps & {
    context: Extract<ContextType, 'author'>
    data: {
      entry: GetAuthor
    }
  }
>

type TagPageProps = Simplify<
  BasePageProps & {
    context: Extract<ContextType, 'tag'>
    data: {
      entry: GetTag
    }
  }
>

type IndexPageProps = Simplify<
  BasePageProps & {
    context: Extract<ContextType, 'index' | 'home' | 'paged'>
    data: {
      entry: GetConfig
      posts: GetPost[]
    }
    pagination: Pagination
  }
>

type CustomPageProps = Simplify<
  BasePageProps & {
    context: null
    data: {
      entry: GetConfig
    }
  }
>

type InternalPageProps = {
  context: 'internal'
}

export type PageProps =
  | IndexPageProps
  | TagPageProps
  | AuthorPageProps
  | PagePageProps
  | PostPageProps
  | CustomPageProps
  | InternalPageProps

type ControllerResult<T> = Result<T>

async function entryController(
  routingProperties: Extract<RoutingContext, { type: 'entry' }>
): Promise<ControllerResult<PageProps>> {
  const resourceID = routingProperties.resourceItem.id
  const resourceItem = await repository.get(resourceID)

  if (!resourceItem || !resourceItem.dataResult) {
    return err(Errors.notFound())
  }

  const { resourceType, dataResult } = resourceItem

  if (resourceType === 'config') {
    return err(Errors.other('Should never happen.'))
  }

  if (dataResult.isErr()) {
    return dataResult
  }

  switch (resourceType) {
    case 'post':
      return ok({
        context: 'post',
        data: {
          entry: dataResult.value,
        },
        templates: getTemplateHierarchy(routingProperties),
        route: routingProperties.request.path,
      })
    case 'page':
      return ok({
        context: 'page',
        data: {
          entry: dataResult.value,
        },
        templates: getTemplateHierarchy(routingProperties),
        route: routingProperties.request.path,
      })
    case 'author':
      return ok({
        context: 'author',
        data: {
          entry: dataResult.value,
        },
        templates: getTemplateHierarchy(routingProperties),
        route: routingProperties.request.path,
      })
    case 'tag':
      return ok({
        context: 'tag',
        data: {
          entry: dataResult.value,
        },
        templates: getTemplateHierarchy(routingProperties),
        route: routingProperties.request.path,
      })
    default:
      return assertUnreachable(resourceType)
  }
}

async function channelController(
  routingProperties: Extract<RoutingContext, { type: 'channel' }>
): Promise<ControllerResult<PageProps>> {
  const resources = await repository.getAll()
  const posts = Object.values(resources).flatMap((resource) => {
    return resource.resourceType === 'post'
      ? resource.dataResult?.isOk()
        ? [resource.dataResult.value]
        : []
      : []
  })

  const configResourceID = 'content/config/index.json'
  const configResourceItem = resources[configResourceID] as
    | ConfigResourceItem
    | undefined

  if (!configResourceItem || !configResourceItem.dataResult) {
    return err(Errors.notFound(routingProperties.request.path))
  }

  const entry = configResourceItem.dataResult

  if (entry.isErr()) {
    return entry
  }

  return ok({
    context: 'index',
    templates: getTemplateHierarchy(routingProperties),
    data: {
      entry: entry.value,
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
    route: routingProperties.request.path,
  })
}

async function collectionController(
  routingProperties: Extract<RoutingContext, { type: 'collection' }>
): Promise<ControllerResult<PageProps>> {
  const resources = await repository.getAll()
  const posts = Object.values(resources).flatMap((resource) => {
    return resource.resourceType === 'post'
      ? resource.dataResult?.isOk()
        ? [resource.dataResult.value]
        : []
      : []
  })
  const configResourceID = 'content/config/index.json'
  const configResourceItem = resources[configResourceID] as
    | ConfigResourceItem
    | undefined

  if (!configResourceItem || !configResourceItem.dataResult) {
    return err(Errors.notFound(routingProperties.request.path))
  }

  const entry = configResourceItem.dataResult

  if (entry.isErr()) {
    return entry
  }

  return ok({
    context: 'index',
    templates: getTemplateHierarchy(routingProperties),
    data: {
      entry: entry.value,
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
    route: routingProperties.request.path,
  })
}

async function customController(
  routingProperties: Extract<RoutingContext, { type: 'custom' }>
): Promise<ControllerResult<PageProps>> {
  const resources = await repository.getAll()

  const configResourceID = 'content/config/index.json'
  const configResourceItem = resources[configResourceID] as
    | ConfigResourceItem
    | undefined

  if (!configResourceItem || !configResourceItem.dataResult) {
    return err(Errors.notFound(routingProperties.request.path))
  }

  const entry = configResourceItem.dataResult

  if (entry.isErr()) {
    return entry
  }

  return ok({
    context: null,
    templates: getTemplateHierarchy(routingProperties),
    data: {
      entry: entry.value, // TODO embed the first one from the data list
    },
    route: routingProperties.request.path,
  })
}

export type ControllerReturnType = Exclude<
  AsyncReturnType<typeof controller>,
  null
>

export async function controller(
  routingProperties: RoutingContext
): Promise<
  | { type: 'props'; props: ControllerResult<PageProps> }
  | { type: 'redirect'; redirect: Redirect }
> {
  if (!routingProperties) {
    return { type: 'props', props: err(Errors.notFound()) }
  }

  const { type } = routingProperties

  switch (type) {
    case 'collection':
      return {
        type: 'props',
        props: await collectionController(routingProperties),
      }
    case 'channel':
      return {
        type: 'props',
        props: await channelController(routingProperties),
      } // TODO
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
    case 'internal':
      return {
        type: 'props',
        props: ok({
          context: 'internal',
        }),
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
