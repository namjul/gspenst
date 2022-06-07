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
import {
  createLoaders,
  processData,
  processQuery,
} from './helpers/processQuery'
import type { DataLoaders } from './helpers/processQuery'
import { getTemplateHierarchy } from './helpers/getTemplateHierarchy'
import type { Result, ResultAsync, Option } from './shared-kernel'
import * as Errors from './errors'
import { do_, absurd } from './shared/utils'
import type { ThemeContext } from './domain/theming'
import { configId } from './constants'
import repository from './repository'

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

  return processQuery(query, dataLoaders).andThen((_data) => {
    return ok({
      context: resourceType,
      resource: _data.resource,
      data: {},
      templates: getTemplateHierarchy(routingContext),
      route: routingContext.request.path,
    })
  })
}

async function channelController(
  routingContext: ChannelRoutingContext,
  dataLoaders: DataLoaders
): Promise<ControllerResultAsync<PageProps>> {
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

  return repository.find({ id: configId }).andThen((configResource) => {
    return processData(data, dataLoaders).andThen((_data) => {
      // TODO
      // if ((limit === 'all' && page > 1) || page > pages) {
      //   //redirect
      // }

      return ok({
        context: 'index' as const,
        templates: getTemplateHierarchy(routingContext),
        resource: configResource,
        data: _data,
        route: routingContext.request.path,
      })
    })
  })
}

async function collectionController(
  routingProperties: CollectionRoutingContext,
  dataLoaders: DataLoaders
): Promise<ControllerResultAsync<PageProps>> {
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

  return repository.find({ id: configId }).andThen((configResource) => {
    return processData(data, dataLoaders).andThen((_data) => {
      return ok({
        context: 'index' as const,
        resource: configResource,
        templates: getTemplateHierarchy(routingProperties),
        data: _data,
        route: routingProperties.request.path,
      })
    })
  })
}

async function customController(
  routingProperties: CustomRoutingContext,
  dataLoaders: DataLoaders
): Promise<ControllerResultAsync<PageProps>> {
  const data: { [name: string]: DataQuery } = {
    ...routingProperties.data,
  }

  return repository.find({ id: configId }).andThen((configResource) => {
    return processData(data, dataLoaders).andThen((_data) => {
      return ok({
        context: null,
        resource: configResource,
        templates: getTemplateHierarchy(routingProperties),
        data: _data,
        route: routingProperties.request.path,
      })
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
