import type { RoutesConfig } from './domain/routes'
import type { LocatorResource } from './domain/resource'
import { filterLocatorResources } from './helpers/resource'
import repository from './repository'
import { routerManager } from './router'
import { controller } from './controller'
import { createLoaders } from './helpers/processQuery'
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
  isBuildPhase: boolean
}

export const getPaths = (config: Config) => {
  const paths = routerManager(config.routesConfig).resolvePaths(
    config.resources
  )
  log('Page [...slug].js getStaticPaths', JSON.stringify(paths, null, 2))
  return paths
}

export const getProps = async (config: Config, params: string | string[]) => {
  log('Page [...slug].js getStaticProps', params)
  const routingContext = routerManager(config.routesConfig).handle(params)
  return controller(
    routingContext,
    createLoaders(undefined, config.isBuildPhase)
  )
}

export { collect } from './collect'
export { startTinaServer } from './tina-server'
export { routerManager, controller, repository, parseRoutes }
