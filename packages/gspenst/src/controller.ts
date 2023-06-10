import {
  type GspenstResult,
  type GspenstResultAsync,
  type Option,
  ok,
  err,
  do_,
  assertUnreachable,
} from './shared/kernel'
import {
  type RoutingContext,
  type CollectionRoutingContext,
  type ChannelRoutingContext,
  type EntryRoutingContext,
  type CustomRoutingContext,
  type Redirect,
} from './domain/routing'
import { type LocatorResource } from './domain/resource/resource.locator'
import { type DataQuery } from './domain/routes'
import { type DataLoaders, createLoaders } from './processQuery'
import { processData, type ProcessData } from './processData'
import { filterLocatorResources } from './helpers/resource'
import { getContext } from './helpers/getContext'
import { getTemplateHierarchy } from './helpers/getTemplateHierarchy'
import * as Errors from './errors'
import { type ThemeContext } from './domain/theming'
import { configId, MAIN_ENTRY } from './constants'
import repository from './repository'
import { confifyTinaData } from './helpers/confifyTinaData'

type ControllerResult<T> = GspenstResult<T>
type ControllerResultAsync<T> = GspenstResultAsync<T>

async function routeController(
  routingContext:
    | CollectionRoutingContext
    | ChannelRoutingContext
    | EntryRoutingContext
    | CustomRoutingContext,
  dataLoaders: DataLoaders
): Promise<ControllerResultAsync<ThemeContext>> {
  const dataQueries: Record<string, DataQuery> = {
    ...('data' in routingContext ? routingContext.data : {}),
  }

  if (
    routingContext.type === 'channel' ||
    routingContext.type === 'collection'
  ) {
    dataQueries.posts = {
      type: 'browse',
      resourceType: 'post',
      filter: routingContext.filter,
      limit: routingContext.limit,
      order: routingContext.order,
      page: routingContext.request.params?.page,
    }
  }

  if (routingContext.type === 'entry') {
    dataQueries[MAIN_ENTRY] = {
      type: 'read',
      resourceType: routingContext.resourceType,
      ...routingContext.request.params,
    }
  }

  return repository.find({ id: configId }).andThen((configResource) => {
    return processData(dataLoaders, dataQueries).andThen(
      (result) => {

        // TODO
        // if ((limit === 'all' && page > 1) || page > pages) {
        //   //redirect
        // }

        const { data, entities } = result

        if (configResource.type !== 'config') {
          return err(Errors.absurd('Did not fetch config resource'))
        }

        const mainResource = findMainResource(result)
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
          route: routingContext.request.path,
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
    | GspenstResult<Option<RoutingContext>>
    | GspenstResult<Option<RoutingContext>[]>,
  dataLoaders: DataLoaders = createLoaders()
): GspenstResult<Promise<ControllerReturnType>> {
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
          case 'channel':
          case 'custom':
          case 'entry':
            return {
              type: 'props' as const,
              props: await routeController(context, dataLoaders),
            }
          case 'redirect':
            return {
              type: 'redirect' as const,
              redirect: context.redirect,
            }
          default:
            return assertUnreachable(type)
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

function findMainResource(
  { data, resources }: ProcessData
): Option<LocatorResource> {
  const entries = Object.entries(data)
  const mainIndex = entries.findIndex(([key]) => key === MAIN_ENTRY)

  return entries
    .flatMap<LocatorResource>(([_, dataSchema]) => {
      if (dataSchema.type === 'read') {
        const resource = resources[dataSchema.resource]
        if (resource && filterLocatorResources(resource)) {
          return resource
        }
      }
      return []
    })
    .at(mainIndex > -1 ? mainIndex : 0)
}
