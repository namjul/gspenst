import type { RoutesConfig } from './domain/routes'
import type { LocatorResource } from './domain/resource'
import { filterLocatorResources } from './domain/resource'
import repository from './repository'
import { routerManager } from './router'
import { controller } from './controller'
import { parseRoutesWithDefaults as parseRoutes } from './domain/routes'
import { getPageMap } from './helpers/getPageMap'

export const init = (routesConfigInput: unknown) => {
  const routesConfigResult = parseRoutes(routesConfigInput)

  if (routesConfigResult.isErr()) {
    return routesConfigResult
  }

  const routesConfig = routesConfigResult.isOk()
    ? routesConfigResult.value[0]!
    : {}

  return repository.collect(routesConfig).map((resources) => {
    const locatorResources = resources.filter(filterLocatorResources)

    const pageMap = getPageMap(resources, routesConfig)

    return { pageMap, routesConfig, resources: locatorResources }
  })
}

type Config = {
  routesConfig: RoutesConfig
  resources: LocatorResource[]
}

export const createWrapper = (
  config: Config = { routesConfig: {}, resources: [] }
) => {
  const getPaths = () => {
    console.log('Page [...slug].js getStaticPaths')
    return routerManager(config.routesConfig).resolvePaths(config.resources)
  }

  const getProps = async (params: string | string[]) => {
    const routingContext = routerManager(config.routesConfig).handle(params)
    return controller(routingContext)
  }

  return {
    getPaths,
    getProps,
  }
}

export { collect } from './collect'
export { startTinaServer } from './tinaServer'
export { routerManager, controller, repository, parseRoutes }
