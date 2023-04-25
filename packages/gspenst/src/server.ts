import {
  parseRoutesWithDefaults as parseRoutes,
  type RoutesConfig,
} from './domain/routes'
import { filterLocatorResources } from './helpers/resource'
import repository from './repository'
import { routerManager } from './router'
import { controller } from './controller'
import { createLoaders } from './helpers/processQuery'
import { getPageMap } from './helpers/getPageMap'
import { createLogger } from './logger'
import { startSubprocess } from './utils'

const log = createLogger(`server`)

export const build = (routesConfigInput: unknown) => {
  const routesConfigResult = parseRoutes(routesConfigInput)

  if (routesConfigResult.isErr()) {
    return routesConfigResult
  }

  const routesConfig = routesConfigResult.isOk()
    ? routesConfigResult.value[0]!
    : {}

  return repository.collect(routesConfig).map((resources) => {
    const pageMap = getPageMap(resources, routesConfig) // remove and add call to loader.ts
    return { pageMap, routesConfig }
  })
}

export const buildTina = (path: string) => {
  return startSubprocess({ command: 'tinacms build', cwd: path })
}

type Config = {
  routesConfig: RoutesConfig
  isBuildPhase: boolean
}

export const getPaths = (config: Config) => {
  return repository.getAll().map((resources) => {
    const locatorResources = resources.filter(filterLocatorResources)
    // TODO validate config.routesConfig, because there can be references that actually don't exist
    const paths = routerManager(config.routesConfig).resolvePaths(
      locatorResources
    )
    log('Page [...slug].js getStaticPaths', JSON.stringify(paths, null, 2))
    return paths
  })
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
