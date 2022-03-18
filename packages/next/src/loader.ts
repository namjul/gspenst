import debug from 'debug'
import yaml from 'js-yaml'
import type { LoaderDefinition } from 'webpack'
import type { Options } from './types'
import { createRoutingMap } from './utils/routing'
import { validate } from './utils/validate'

const log = debug('@gspenst/next:loader')

type LoaderOptions = Options

/* eslint-disable @typescript-eslint/no-invalid-this */

// lookup: https://webpack.js.org/api/loaders/

const paramRegExp = /\[\[?\.*(\w*)\]\]?/ // match dynamic routes
const isProductionBuild = process.env.NODE_ENV === 'production'

const loader: LoaderDefinition<LoaderOptions> = function loader(source) {
  // Tells the loader-runner that the loader intends to call back asynchronously. Returns this.callback.
  const callback = this.async()

  // make this loader non cacheable
  this.cacheable(true)

  // get options passed to loader
  const { projectPath } = this.getOptions()

  if (!isProductionBuild) {
    // Add the entire directory `pages` as the dependency
    // so we when manually editing the files pages are rebuild
    this.addContextDependency(projectPath)
  }

  const { resourcePath } = this
  const filename = resourcePath.slice(resourcePath.lastIndexOf('/') + 1)
  const routingParameter = (
    (paramRegExp.exec(filename) ?? []) as Array<string | undefined>
  )[1]

  const routingConfig = validate(yaml.load(source))

  log(resourcePath, filename, routingParameter, routingConfig)

  void createRoutingMap(routingConfig).then((routingMap) => {
    const imports = `
import * as server from '@gspenst/next/server'
// import TemplateEntryPage from '@gspenst/theme'

export { default } from '@gspenst/next/client'
`

    const dataFetchingFunctions = `
export const getStaticPaths = server.getStaticPaths(${JSON.stringify(
      routingMap
    )}, '${routingParameter}')
export const getStaticProps = server.getStaticProps(${JSON.stringify(
      routingConfig
    )}, '${routingParameter}')
`

    source = `${imports}\n${dataFetchingFunctions}`

    callback(null, source)
  })

  return undefined
}

export default loader
