import { ok, err } from 'neverthrow'
import type { Redirect } from 'next'
import type { RoutingContext } from './routing'
import { assertUnreachable } from './helpers'
import { getTemplateHierarchy } from './dataUtils'
import repository from './repository'
import type {
  ThemeContextType,
  Result,
  Simplify,
  // DataQuery,
} from './types'
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
    context: Extract<ThemeContextType, 'post'>
    data: {
      // entry: GetPost
    }
  }
>

type PagePageProps = Simplify<
  BasePageProps & {
    context: Extract<ThemeContextType, 'page'>
    data: {
      // entry: GetPage
    }
  }
>

type AuthorPageProps = Simplify<
  BasePageProps & {
    context: Extract<ThemeContextType, 'author'>
    data: {
      // entry: GetAuthor
    }
  }
>

type TagPageProps = Simplify<
  BasePageProps & {
    context: Extract<ThemeContextType, 'tag'>
    data: {
      // entry: GetTag
    }
  }
>

type IndexPageProps = Simplify<
  BasePageProps & {
    context: Extract<ThemeContextType, 'index' | 'home' | 'paged'>
    data: {
      // entry: GetConfig
      // posts: GetPost[]
    }
    pagination: Pagination
  }
>

type CustomPageProps = Simplify<
  BasePageProps & {
    context: null
    data: {
      // entry: GetConfig
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

// async function processQuery(query: DataQuery) {
//   const { type } = query
//
//   if (type === 'read') {
//     const resourceItemResult = await repository.find({
//       slug: query.slug,
//     })
//
//     return resourceItemResult.map(({ dataResult }) => dataResult)
//   } else {
//     const resourcesResult = await repository.findAll(query.resourceType)
//
//     return resourcesResult.map((resources) => {
//       return resources.map(({ dataResult }) => dataResult)
//     })
//   }
// }

async function entryController(
  routingProperties: Extract<RoutingContext, { type: 'entry' }>
): Promise<ControllerResult<PageProps>> {
  const { params } = routingProperties.request
  const resourceItemResult = await repository.find(params ?? {})

  // const query: DataQuery = {
  //   resourceType: routingProperties.resourceItem.resourceType,
  //   type: 'read',
  //   options: {
  //
  //   }
  // }

  return resourceItemResult.map((resourceItem) => {
    const { resourceType, dataResult } = resourceItem

    switch (resourceType) {
      case 'post':
        return {
          context: 'post' as const,
          data: {
            entry: dataResult,
          },
          templates: getTemplateHierarchy(routingProperties),
          route: routingProperties.request.path,
        }
      case 'page':
        return {
          context: 'page' as const,
          data: {
            entry: dataResult,
          },
          templates: getTemplateHierarchy(routingProperties),
          route: routingProperties.request.path,
        }
      case 'author':
        return {
          context: 'author' as const,
          data: {
            entry: dataResult,
          },
          templates: getTemplateHierarchy(routingProperties),
          route: routingProperties.request.path,
        }
      case 'tag':
        return {
          context: 'tag' as const,
          data: {
            entry: dataResult,
          },
          templates: getTemplateHierarchy(routingProperties),
          route: routingProperties.request.path,
        }
      default:
        return assertUnreachable(resourceType)
    }
  })
}

async function channelController(
  routingProperties: Extract<RoutingContext, { type: 'channel' }>
): Promise<ControllerResult<PageProps>> {
  // const posts = (await repository.findAll('post'))

  // const configResourceID = 'content/config/index.json'
  // const configResourceItem = resources[configResourceID] as
  //   | ConfigResourceItem
  //   | undefined
  //
  // if (!configResourceItem || !configResourceItem.dataResult) {
  //   return err(Errors.notFound(routingProperties.request.path))
  // }
  //
  // const entry = configResourceItem.dataResult
  //
  // if (entry.isErr()) {
  //   return entry
  // }

  // const dataEntries = await Promise.all(
  //   Object.entries(routingProperties.data).map(async ([name, query]) => {
  //     return [name, await processQuery(query)] as const
  //   })
  // )

  return ok({
    context: 'index',
    templates: getTemplateHierarchy(routingProperties),
    data: {
      // entry: entry.value,
      // posts,
      // ...dataEntries,
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
  // const posts = await repository.findAll('post')
  //
  // if (posts.isErr()) {
  //   return err(posts.error)
  // }

  // const configResourceID = 'content/config/index.json'
  // const configResourceItem = await repository.get(configResourceID)
  //
  // if (configResourceItem.isErr()) {
  //   return err(configResourceItem.error)
  // }
  //
  // const entry = configResourceItem.value.dataResult
  //
  // if (entry.isErr()) {
  //   return err(
  //     Errors.other(
  //       'Controller: ',
  //       entry.error instanceof Error ? entry.error : undefined
  //     )
  //   )
  // }

  // const dataEntries = await Promise.all(
  //   Object.entries(routingProperties.data).map(async ([name, query]) => {
  //     return [name, await processQuery(query)] as const
  //   })
  // )

  return ok({
    context: 'index',
    templates: getTemplateHierarchy(routingProperties),
    data: {
      // entry: entry.value,
      // posts,
      // ...dataEntries,
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
  // const resources = await repository.getAll()

  // const configResourceID = 'content/config/index.json'
  // const configResourceItem = resources[configResourceID] as
  //   | ConfigResourceItem
  //   | undefined
  //
  // if (!configResourceItem || !configResourceItem.dataResult) {
  //   return err(Errors.notFound(routingProperties.request.path))
  // }
  //
  // const entry = configResourceItem.dataResult
  //
  // if (entry.isErr()) {
  //   return entry
  // }

  // const dataEntries = await Promise.all(
  //   Object.entries(routingProperties.data).map(async ([name, query]) => {
  //     return [name, await processQuery(query)] as const
  //   })
  // )

  return ok({
    context: null,
    templates: getTemplateHierarchy(routingProperties),
    data: {
      // entry: entry.value, // TODO embed the first one from the data list
      // ...Object.fromEntries(dataEntries),
    },
    route: routingProperties.request.path,
  })
}

type ControllerReturnType =
  | { type: 'props'; props: ControllerResult<PageProps> }
  | { type: 'redirect'; redirect: Redirect }

export async function controller(
  routingContexts: RoutingContext[] = []
): Promise<ControllerReturnType> {
  for (const context of routingContexts) {
    // eslint-disable-next-line no-await-in-loop
    const result: ControllerReturnType = await (async () => {
      const { type } = context

      switch (type) {
        case 'collection':
          return {
            type: 'props',
            props: await collectionController(context),
          }
        case 'channel':
          return {
            type: 'props',
            props: await channelController(context),
          }
        case 'entry':
          return {
            type: 'props',
            props: await entryController(context),
          }
        case 'custom':
          return {
            type: 'props',
            props: await customController(context),
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
            redirect: context,
          }
        default:
          return assertUnreachable(type)
      }
    })() // Immediately invoke the function

    if (result.type === 'props') {
      if (result.props.isOk()) {
        return result
      }
    }
  }

  return { type: 'props', props: err(Errors.notFound()) }
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
