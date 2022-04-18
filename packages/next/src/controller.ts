import { ok, err, combine } from 'neverthrow'
import type { Redirect } from 'next'
import nql from '@tryghost/nql'
import type { RoutingContext } from './routing'
import { assertUnreachable } from './helpers'
import { getTemplateHierarchy } from './dataUtils'
import repository from './repository'
import type {
  ThemeContextType,
  Result,
  Simplify,
  DataQuery,
  AsyncReturnType,
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

type ExtractGeneric<Type> = Type extends Result<infer X> ? X : never
type ProcessQueryReturnType = ExtractGeneric<
  AsyncReturnType<typeof processQuery>
>

async function processQuery(query: DataQuery) {
  const { type } = query

  switch (type) {
    case 'read':
      return (
        await repository.find({
          slug: query.slug,
        })
      ).map(({ dataResult }) => {
        return dataResult
      })
    case 'browse':
      return (await repository.findAll(query.resourceType)).map((resources) => {
        return resources
          .filter((resourceItem) => {
            return query.filter
              ? nql(query.filter).queryJSON(resourceItem)
              : true
          })
          .map(({ dataResult }) => dataResult)
      })
    default:
      return assertUnreachable(type)
  }
}

async function entryController(
  routingProperties: Extract<RoutingContext, { type: 'entry' }>
): Promise<ControllerResult<PageProps>> {
  const { resourceType, request } = routingProperties
  const query: DataQuery = {
    resourceType,
    type: 'read',
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain --- TODO: return ErrResult if `slug` is not defined
    slug: request.params?.slug!,
  }

  return (await processQuery(query)).map((entry) => {
    return {
      context: resourceType,
      data: {
        entry,
      },
      templates: getTemplateHierarchy(routingProperties),
      route: routingProperties.request.path,
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

  const postsQuery: DataQuery = {
    type: 'browse',
    resourceType: 'post',
    filter: routingProperties.filter,
    limit: routingProperties.limit,
    order: routingProperties.order,
  }

  const data: { [name: string]: DataQuery } = {
    ...routingProperties.data,
    posts: postsQuery,
  }

  const keys = Object.keys(data)
  const dataResults = await Promise.all(
    keys.map(async (key) => {
      return processQuery(data[key]!) // eslint-disable-line @typescript-eslint/no-non-null-asserted-optional-chain
    })
  )

  return combine(dataResults).map((y) => {
    const dataEntries = keys.reduce<{
      [key: string]: ProcessQueryReturnType
    }>((acc, current, index) => {
      const dataResult = y[index]!
      return {
        ...acc,
        [current]: dataResult,
      }
    }, {})

    return {
      context: 'index',
      templates: getTemplateHierarchy(routingProperties),
      data: {
        // entry: entry.value,
        // posts,
        ...dataEntries,
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
    }
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

  const postsQuery: DataQuery = {
    type: 'browse',
    resourceType: 'post',
    filter: routingProperties.filter,
    limit: routingProperties.limit,
    order: routingProperties.order,
  }

  const data: { [name: string]: DataQuery } = {
    ...routingProperties.data,
    posts: postsQuery,
  }

  const keys = Object.keys(data)
  const dataResults = await Promise.all(
    keys.map(async (key) => {
      return processQuery(data[key]!) // eslint-disable-line @typescript-eslint/no-non-null-asserted-optional-chain
    })
  )

  return combine(dataResults).map((dataEntry) => {
    const dataEntries = keys.reduce<{
      [key: string]: ProcessQueryReturnType
    }>((acc, current, index) => {
      const dataResult = dataEntry[index]!
      return {
        ...acc,
        [current]: dataResult,
      }
    }, {})

    return {
      context: 'index',
      templates: getTemplateHierarchy(routingProperties),
      data: {
        // entry: entry.value,
        // posts,
        ...dataEntries,
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
    }
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

  const keys = Object.keys(routingProperties.data ?? {})
  const dataResults = await Promise.all(
    keys.map(
      async (key) => processQuery(routingProperties.data?.[key]!) // eslint-disable-line @typescript-eslint/no-non-null-asserted-optional-chain
    )
  )

  return combine(dataResults).map((y) => {
    const dataEntries = keys.reduce<{
      [key: string]: ProcessQueryReturnType
    }>((acc, current, index) => {
      const dataResult = y[index]!
      return {
        ...acc,
        [current]: dataResult,
      }
    }, {})

    return {
      context: null,
      templates: getTemplateHierarchy(routingProperties),
      data: {
        // entry: entry.value, // TODO embed the first one from the data list
        ...dataEntries,
      },
      route: routingProperties.request.path,
    }
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
      } else if (result.props.error.type !== 'NotFound') {
        return result
      }
    }
    if (result.type === 'redirect') {
      return result
    }
  }

  return { type: 'props', props: err(Errors.notFound('No controller found')) }
}
