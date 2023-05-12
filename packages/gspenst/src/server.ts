import EventEmitter, { once } from 'events'
import path from 'path'
import fse from 'fs-extra'
import {
  parseRoutes,
  type RoutesConfigInput,
  type RoutesConfig,
} from './domain/routes'
import { filterLocatorResources, isRoutesResource } from './helpers/resource'
import repository from './repository'
import { routerManager } from './router'
import { controller } from './controller'
import { createLoaders } from './helpers/processQuery'
import {
  getPageMap,
  getRoutingMapping,
  type PageMap,
} from './helpers/getPageMap'
import { createLogger } from './logger'
import { startSubprocess } from './utils'

const log = createLogger(`server`)

export const build = (routesConfigInput: RoutesConfigInput) => {
  return repository.collect(routesConfigInput).map((resources) => {
    const routesResource = resources.find(isRoutesResource)
    const pageMap = getPageMap(resources)
    updateRoutingMapping(pageMap)
    return { pageMap, routesConfig: routesResource?.data }
  })
}

export const buildTina = (cwd: string) => {
  return startSubprocess({ command: 'tinacms build', cwd })
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

export async function startTinaServer(
  this: { projectPath: string } & EventEmitter,
  config: { onlyCheck: boolean }
) {
  if (!config.onlyCheck) {
    log('Starting tina server', this.projectPath)

    const ps = await startSubprocess({
      command: 'tinacms dev',
      cwd: this.projectPath,
    })

    this.on('cleanup', () => {
      ps?.kill()
    })

    // TODO output errors
    if (ps?.stdout) {
      let flag = true
      while (flag) {
        const [data] = (await once(ps.stdout, 'data')) as Buffer[] // eslint-disable-line no-await-in-loop
        const msg = data?.toString().trim()
        if (msg) {
          log(msg)
          // eslint-disable-next-line max-depth
          if (msg.includes('4001')) {
            flag = false
          }
        }
      }
    }

    return ps
  }
}

export function updateRoutingMapping(pageMap: PageMap) {
  log('Writing `routingMapping.json`...')
  const routingMapping = getRoutingMapping(pageMap)
  const packagePath: string = path.dirname(
    require.resolve(`gspenst/package.json`)
  )
  const routingMappingFilePath = path.resolve(
    packagePath,
    './routingMapping.json'
  )
  return fse.writeJsonSync(routingMappingFilePath, routingMapping)
}

export { collect } from './collect'
export { routerManager, controller, repository, parseRoutes, getPageMap }
