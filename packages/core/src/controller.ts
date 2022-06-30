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
import { findMainResource } from './helpers/findMainResource'

// export type PageProps =
//   | {
//       context: ContextType
//       templates: string[]
//       data: {
//         entry: GetPost | GetPage | GetAuthor | GetTag | GetConfig
//         [name: string]: unknown
//       }
//       pagination?: Pagination
//     }
//   | { context: 'internal' }

// export type PageProps = ThemeContext

type ControllerResult<T> = Result<T>
type ControllerResultAsync<T> = ResultAsync<T>

async function entryController(
  routingContext: EntryRoutingContext,
  dataLoaders: DataLoaders
): Promise<ControllerResult<ThemeContext>> {
  return repository.find({ id: configId }).andThen((configResource) => {
    return processData(dataLoaders, {
      main: {
        resourceType: routingContext.resourceType,
        type: 'read',
        ...routingContext.request.params,
      },
    }).andThen(({ data, entities }) => {
      const { main } = data

      if (!main || main.type !== 'read') {
        return err(Errors.absurd('error in processData'))
      }

      if (configResource.resourceType !== 'config') {
        return err(Errors.absurd('Did not fetch config resource'))
      }

      const resources = entities.resources
      const id = main.resource
      const mainResource = resources?.[id]

      if (mainResource) {
        const mainResourceResult = confifyTinaData(configResource, mainResource)

        if (mainResourceResult.isErr()) {
          return err(mainResourceResult.error)
        }

        return ok({
          context: getContext(routingContext),
          resource: mainResourceResult.value,
          data: {},
          entities,
          templates: getTemplateHierarchy(routingContext),
        })
      }
      return err(Errors.absurd('Could not find main resource'))
    })
  })
}

async function channelController(
  routingContext: ChannelRoutingContext,
  dataLoaders: DataLoaders
): Promise<ControllerResultAsync<ThemeContext>> {
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

      const mainResource = findMainResource(data, entities)

      const mainResourceResult = confifyTinaData(configResource, mainResource)

      if (mainResourceResult.isErr()) {
        return err(mainResourceResult.error)
      }

      return ok({
        context: getContext(routingContext),
        templates: getTemplateHierarchy(routingContext),
        resource: mainResourceResult.value,
        data,
        entities,
      })
    })
  })
}

async function collectionController(
  routingContext: CollectionRoutingContext,
  dataLoaders: DataLoaders
): Promise<ControllerResultAsync<ThemeContext>> {
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

      const mainResource = findMainResource(data, entities)

      const mainResourceResult = confifyTinaData(configResource, mainResource)

      if (mainResourceResult.isErr()) {
        return err(mainResourceResult.error)
      }

      return ok({
        context: getContext(routingContext),
        resource: mainResourceResult.value,
        templates: getTemplateHierarchy(routingContext),
        data,
        entities,
      })
    })
  })
}

async function customController(
  routingContext: CustomRoutingContext,
  dataLoaders: DataLoaders
): Promise<ControllerResultAsync<ThemeContext>> {
  return repository.find({ id: configId }).andThen((configResource) => {
    return processData(dataLoaders, routingContext.data).andThen(
      ({ data, entities }) => {
        if (configResource.resourceType !== 'config') {
          return err(Errors.absurd('Did not fetch config resource'))
        }

        const mainResource = findMainResource(data, entities)

        const mainResourceResult = confifyTinaData(configResource, mainResource)

        if (mainResourceResult.isErr()) {
          return err(mainResourceResult.error)
        }

        return ok({
          context: null,
          resource: mainResourceResult.value,
          templates: getTemplateHierarchy(routingContext),
          data,
          entities,
        })
      }
    )
  })
}

type ControllerReturnType =
  | { type: 'props'; props: ControllerResult<ThemeContext> }
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
