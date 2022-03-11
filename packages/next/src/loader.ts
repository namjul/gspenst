import yaml from 'js-yaml'
import type { LoaderDefinition } from 'webpack'
import type { Options } from './types'
import { createRoutingMap } from './utils/routing'

type LoaderOptions = Options

/* eslint-disable @typescript-eslint/no-invalid-this */

// lookup: https://webpack.js.org/api/loaders/

// const dynamicPage = /\[.*\]/
const paramRegExp = /\[\[?\.*(\w*)\]\]?/ // match dynamic routes

const loader: LoaderDefinition<LoaderOptions> = function loader(source) {
  // Tells the loader-runner that the loader intends to call back asynchronously. Returns this.callback.
  const callback = this.async()

  // make this loader non cacheable
  this.cacheable(false)

  // get options passed to loader
  // const options = this.getOptions()

  // let { theme, themeConfig } = options
  //
  // // Relative path instead of a package name
  // if (theme.startsWith('.') || theme.startsWith('/')) {
  //   theme = path.resolve(theme)
  // }
  // if (themeConfig) {
  //   themeConfig = path.resolve(themeConfig)
  // }

  const { resourcePath } = this
  const filename = resourcePath.slice(resourcePath.lastIndexOf('/') + 1)
  const routingParameter = (
    (paramRegExp.exec(filename) ?? []) as Array<string | undefined>
  )[1]

  const routing = yaml.load(source) as {}

  console.log(resourcePath, filename, routingParameter, routing)

  void createRoutingMap(routing).then((routingMap) => {
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
      routing
    )}, '${routingParameter}')
`

    source = `${imports}\n${dataFetchingFunctions}`

    callback(null, source)
  })

  return undefined
}

export default loader
