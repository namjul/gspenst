import type { Redirect } from 'next'
import { ok, err, combine, okAsync } from './shared-kernel'
import type { RoutingContext } from './router'
import type { DataQuery } from './domain/routes'
import { processQuery } from './helpers/processQuery'
import type { QueryOutcome } from './helpers/processQuery'
import { getTemplateHierarchy } from './helpers/getTemplateHierarchy'
import type { ThemeContextType } from './types'
import type { Result, ResultAsync, Simplify, Option } from './shared-kernel'
import * as Errors from './errors'
import { do_, absurd } from './utils'

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
    [name: string]: QueryOutcome
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
type ControllerResultAsync<T> = ResultAsync<T>

function entryController(
  routingProperties: Extract<RoutingContext, { type: 'entry' }>
): ControllerResultAsync<PageProps> {
  const { resourceType, request } = routingProperties
  const query: DataQuery = {
    resourceType,
    type: 'read',
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain --- TODO: return ErrResult if `slug` is not defined
    slug: request.params?.slug!,
    redirect: false,
  }

  return processQuery(query).map((entry) => {
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

function channelController(
  routingProperties: Extract<RoutingContext, { type: 'channel' }>
): ControllerResultAsync<PageProps> {
  // const posts = (await repository.findAll('post'))

  // const configResourceID = 'content/config/index.json'
  // const configResourceItem = resources[configResourceID] as
  //   | ConfigResourceItem
  //   | undefined
  //
  // if (!configResourceItem || !configResourceItem.tinaData) {
  //   return err(Errors.notFound(routingProperties.request.path))
  // }
  //
  // const entry = configResourceItem.tinaData
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
    page: routingProperties.request.params?.page,
  }

  const data: { [name: string]: DataQuery } = {
    ...routingProperties.data,
    posts: postsQuery,
  }

  const keys = Object.keys(data)
  const result = combine(keys.map((key) => processQuery(data[key]!)))

  return result.andThen((resource) => {
    const dataEntries = keys.reduce((acc, current, index) => {
      const queryOutcome = resource[index]
      return {
        ...acc,
        [current]: queryOutcome,
      }
    }, {})

    return okAsync({
      context: 'index' as const,
      templates: getTemplateHierarchy(routingProperties),
      data: {
        ...dataEntries,
      },
      route: routingProperties.request.path,
    })
  })
}

function collectionController(
  routingProperties: Extract<RoutingContext, { type: 'collection' }>
): ControllerResultAsync<PageProps> {
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
  // const entry = configResourceItem.value.tinaData
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
    page: routingProperties.request.params?.page,
  }

  const data: { [name: string]: DataQuery } = {
    ...routingProperties.data,
    posts: postsQuery,
  }

  const keys = Object.keys(data)
  const result = combine(
    keys.map((key) => {
      return processQuery(data[key]!)
    })
  )

  return result.andThen((resource) => {
    const dataEntries = keys.reduce((acc, current, index) => {
      const queryOutcome = resource[index]
      return {
        ...acc,
        [current]: queryOutcome,
      }
    }, {})

    return okAsync({
      context: 'index' as const,
      templates: getTemplateHierarchy(routingProperties),
      data: {
        ...dataEntries,
      },
      route: routingProperties.request.path,
    })
  })
}

function customController(
  routingProperties: Extract<RoutingContext, { type: 'custom' }>
): ControllerResultAsync<PageProps> {
  // const resources = await repository.getAll()

  // const configResourceID = 'content/config/index.json'
  // const configResourceItem = resources[configResourceID] as
  //   | ConfigResourceItem
  //   | undefined
  //
  // if (!configResourceItem || !configResourceItem.tinaData) {
  //   return err(Errors.notFound(routingProperties.request.path))
  // }
  //
  // const entry = configResourceItem.tinaData
  //
  // if (entry.isErr()) {
  //   return entry
  // }

  const data: { [name: string]: DataQuery } = {
    ...routingProperties.data,
  }

  const keys = Object.keys(data)
  const result = combine(keys.map((key) => processQuery(data[key]!)))

  return result.andThen((resource) => {
    const dataEntries = keys.reduce((acc, current, index) => {
      const queryOutcome = resource[index]
      return {
        ...acc,
        [current]: queryOutcome,
      }
    }, {})

    return okAsync({
      context: null,
      templates: getTemplateHierarchy(routingProperties),
      data: {
        // entry: entry.value, // TODO embed the first one from the data list
        ...dataEntries,
      },
      route: routingProperties.request.path,
    })
  })
}

type ControllerReturnType =
  | { type: 'props'; props: ControllerResult<PageProps> }
  | { type: 'redirect'; redirect: Redirect }

export function controller(
  routingContextsResult:
    | Result<Option<RoutingContext>>
    | Result<Option<RoutingContext>[]>
): Result<Promise<ControllerReturnType>> {
  return routingContextsResult.map(async (routingContext) => {
    for (const context of [routingContext].flat()) {
      if (context === undefined) {
        continue
      }

      // eslint-disable-next-line no-await-in-loop
      const result = await do_(async () => {
        const { type } = context

        switch (type) {
          case 'collection':
            return {
              type: 'props' as const,
              props: await collectionController(context),
            }
          case 'channel':
            return {
              type: 'props' as const,
              props: await channelController(context),
            }
          case 'entry':
            return {
              type: 'props' as const,
              props: await entryController(context),
            }
          case 'custom':
            return {
              type: 'props' as const,
              props: await customController(context),
            }
          case 'internal':
            return {
              type: 'props' as const,
              props: ok({
                context: 'internal' as const,
              }),
            }
          case 'redirect':
            return {
              type: 'redirect' as const,
              redirect: context,
            }
          default:
            return absurd(type)
        }
      })

      if (result.type === 'props') {
        if (result.props.isOk()) {
          return {
            ...result,
            props: ok(result.props.value),
          }
        } else if (result.props.error.type !== 'NotFound') {
          return {
            ...result,
            props: err(result.props.error),
          }
        }
      }
      if (result.type === 'redirect') {
        return result
      }
    }

    return {
      type: 'props' as const,
      props: err(Errors.notFound('No controller found')),
    }
  })
}
