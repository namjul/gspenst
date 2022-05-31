import { ok, err } from './shared-kernel'
import type {
  RoutingContext,
  CollectionRoutingContext,
  ChannelRoutingContext,
  EntryRoutingContext,
  CustomRoutingContext,
  Redirect,
} from './domain/routing'
import type { DataQuery } from './domain/routes'
import { createLoaders, processData } from './helpers/processQuery'
import type { DataLoaders } from './helpers/processQuery'
import { getTemplateHierarchy } from './helpers/getTemplateHierarchy'
import type { Result, ResultAsync, Option } from './shared-kernel'
import * as Errors from './errors'
import { do_, absurd } from './shared/utils'
import type { ThemeContext } from './domain/theming'

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

export type PageProps = ThemeContext

type ControllerResult<T> = Result<T>
type ControllerResultAsync<T> = ResultAsync<T>

async function entryController(
  routingContext: EntryRoutingContext,
  dataLoaders: DataLoaders
): Promise<ControllerResult<PageProps>> {
  const { resourceType, request } = routingContext

  const query: DataQuery = {
    resourceType,
    type: 'read',
    ...request.params,
  }

  const data: { [name: string]: DataQuery } = {
    entry: query,
  }

  return processData(data, dataLoaders).andThen((_data) => {
    return ok({
      context: resourceType,
      data: _data,
      templates: getTemplateHierarchy(routingContext),
      route: routingContext.request.path,
    })
  })
}

async function channelController(
  routingContext: ChannelRoutingContext,
  dataLoaders: DataLoaders
): Promise<ControllerResultAsync<PageProps>> {
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
    filter: routingContext.filter,
    limit: routingContext.limit,
    order: routingContext.order,
    page: routingContext.request.params?.page,
  }

  const data: { [name: string]: DataQuery } = {
    ...routingContext.data,
    posts: postsQuery,
  }

  return processData(data, dataLoaders).andThen((_data) => {
    // TODO
    // if ((limit === 'all' && page > 1) || page > pages) {
    //   //redirect
    // }

    return ok({
      context: 'index' as const,
      templates: getTemplateHierarchy(routingContext),
      data: _data,
      route: routingContext.request.path,
    })
  })
}

async function collectionController(
  routingProperties: CollectionRoutingContext,
  dataLoaders: DataLoaders
): Promise<ControllerResultAsync<PageProps>> {
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

  return processData(data, dataLoaders).andThen((_data) => {
    return ok({
      context: 'index' as const,
      templates: getTemplateHierarchy(routingProperties),
      data: _data,
      route: routingProperties.request.path,
    })
  })
}

async function customController(
  routingProperties: CustomRoutingContext,
  dataLoaders: DataLoaders
): Promise<ControllerResultAsync<PageProps>> {
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

  return processData(data, dataLoaders).andThen((_data) => {
    return ok({
      context: null,
      templates: getTemplateHierarchy(routingProperties),
      data: _data,
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
    | Result<Option<RoutingContext>[]>,
  dataLoaders: DataLoaders = createLoaders()
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
              props: await collectionController(context, dataLoaders),
            }
          case 'channel':
            return {
              type: 'props' as const,
              props: await channelController(context, dataLoaders),
            }
          case 'entry':
            return {
              type: 'props' as const,
              props: await entryController(context, dataLoaders),
            }
          case 'custom':
            return {
              type: 'props' as const,
              props: await customController(context, dataLoaders),
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
              redirect: context.redirect,
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
