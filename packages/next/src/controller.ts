// import filterObject from 'filter-obj'
import { ok, err } from './shared/kernel'
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
import { getContext } from './helpers/getContext'
import { getTemplateHierarchy } from './helpers/getTemplateHierarchy'
import type { Result, ResultAsync, Option } from './shared/kernel'
import * as Errors from './errors'
import { do_, absurd } from './shared/utils'
import type { ThemeContext } from './domain/theming'
import { configId } from './constants'
import repository from './repository'
import { confifyTinaData } from './helpers/confifyTinaData'

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
  return repository.find({ id: configId }).andThen((configResource) => {
    return processData(dataLoaders, {
      entry: {
        resourceType: routingContext.resourceType,
        type: 'read',
        ...routingContext.request.params,
      },
    }).andThen(({ data, entities }) => {
      const { entry } = data

      if (!entry || entry.type !== 'read') {
        return err(Errors.absurd('error in processData'))
      }

      if (configResource.resourceType !== 'config') {
        return err(Errors.absurd('Did not fetch config resource'))
      }

      const entryResource =
        'resources' in entities ? entities.resources[entry.resource] : undefined
      if (entryResource) {
        const templates = getTemplateHierarchy(routingContext)

        const resourceResult = confifyTinaData(configResource, entryResource)

        if (resourceResult.isErr()) {
          return err(resourceResult.error)
        }

        return ok({
          context: getContext(routingContext),
          resource: resourceResult.value,
          data: {},
          entities,
          templates,
          route: routingContext.request.path,
        })
      }
      return err(Errors.absurd('Could not find entry'))
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

  return repository.find({ id: configId }).andThen((configResource) => {
    return processData(dataLoaders, {
      ...routingContext.data,
      posts: postsQuery,
    }).andThen(({ data, entities }) => {
      // TODO
      // if ((limit === 'all' && page > 1) || page > pages) {
      //   //redirect
      // }

      if (configResource.resourceType !== 'config') {
        return err(Errors.absurd('Did not fetch config resource'))
      }

      return ok({
        context: getContext(routingContext),
        templates: getTemplateHierarchy(routingContext),
        resource: configResource,
        data,
        entities,
        route: routingContext.request.path,
      })
    })
  })
}

async function collectionController(
  routingContext: CollectionRoutingContext,
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

  return repository.find({ id: configId }).andThen((configResource) => {
    return processData(dataLoaders, {
      ...routingContext.data,
      posts: postsQuery,
    }).andThen(({ data, entities }) => {
      if (configResource.resourceType !== 'config') {
        return err(Errors.absurd('Did not fetch config resource'))
      }

      return ok({
        context: getContext(routingContext),
        resource: configResource,
        templates: getTemplateHierarchy(routingContext),
        data,
        entities,
        route: routingContext.request.path,
      })
    })
  })
}

async function customController(
  routingContext: CustomRoutingContext,
  dataLoaders: DataLoaders
): Promise<ControllerResultAsync<PageProps>> {
  return repository.find({ id: configId }).andThen((configResource) => {
    return processData(dataLoaders, routingContext.data).andThen(
      ({ data, entities }) => {
        return ok({
          context: null,
          resource: configResource,
          templates: getTemplateHierarchy(routingContext),
          data,
          entities,
          route: routingContext.request.path,
        })
      }
    )
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
