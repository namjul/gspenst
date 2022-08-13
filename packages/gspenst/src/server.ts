import type { RoutesConfig } from './domain/routes'
import type { LocatorResource } from './domain/resource'
import { filterLocatorResources } from './helpers/resource'
import repository from './repository'
import { routerManager } from './router'
import { controller } from './controller'
import { parseRoutesWithDefaults as parseRoutes } from './domain/routes'
import { getPageMap } from './helpers/getPageMap'
import { createLogger } from './logger'

const log = createLogger(`server`)

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
    const paths = routerManager(config.routesConfig).resolvePaths(
      config.resources
    )
    log('Page [...slug].js getStaticPaths', JSON.stringify(paths, null, 2))
    return paths
  }

  const getProps = async (params: string | string[]) => {
    log('Page [...slug].js getStaticProps', params)
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
