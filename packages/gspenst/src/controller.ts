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
import type { LocatorResource } from './domain/resource'
import type { DataQuery } from './domain/routes'
import { createLoaders, processData } from './helpers/processQuery'
import type { DataLoaders } from './helpers/processQuery'
import { getContext } from './helpers/getContext'
import { getTemplateHierarchy } from './helpers/getTemplateHierarchy'
import type { Result, ResultAsync, Option } from './shared/kernel'
import * as Errors from './errors'
import { do_, absurd } from './shared/utils'
import type { ThemeContext, Entities, Data } from './domain/theming'
import { configId } from './constants'
import repository from './repository'
import { confifyTinaData } from './helpers/confifyTinaData'

type ControllerResult<T> = Result<T>
type ControllerResultAsync<T> = ResultAsync<T>

const MAIN_ENTRY = Symbol('__mainEntry__') as unknown as string

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

  // const headers = (() => {
  //   const entryData = pageProps.data.entry.data
  //   if ('getPostDocument' in entryData) {
  //     return getHeaders(entryData.getPostDocument.data.body as Root)
  //   }
  //   if ('getPageDocument' in entryData) {
  //     return getHeaders(entryData.getPageDocument.data.body as Root)
  //   }
  // })()

  return repository.find({ id: configId }).andThen((configResource) => {
    return processData(dataLoaders, dataQueries).andThen(
      ({ data, entities }) => {
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
          case 'channel':
          case 'custom':
          case 'entry':
            return {
              type: 'props' as const,
              props: await routeController(context, dataLoaders),
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

export function findMainResource(
  data: Record<string, Data>,
  entities: Entities
): LocatorResource | undefined {
  const entries = Object.entries(data).reverse()
  const mainIndex = entries.findIndex(([key]) => key === MAIN_ENTRY)

  return entries
    .flatMap<LocatorResource>(([_, dataSchema]) => {
      if (dataSchema.type === 'read') {
        const resource = entities.resource?.[dataSchema.resource]
        if (resource?.resourceType !== 'config') {
          return resource ?? []
        }
      }
      return []
    })
    .at(mainIndex > -1 ? mainIndex : 0)
}
