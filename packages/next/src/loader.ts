// import path from 'path'
import yaml from 'js-yaml'
import type { LoaderDefinition } from 'webpack'
import type { LoaderOptions } from './types'

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
  const param = (
    (paramRegExp.exec(filename) ?? []) as Array<string | undefined>
  )[1]

  const routing = yaml.load(source) as {}

  console.log(resourcePath, filename, param, routing)

  const page = `
export default function TemplatePage (props) {
  return <div>
    {JSON.stringify(props, null, 2)}
    {JSON.stringify(${JSON.stringify(routing)}, null, 2)}
  </div>
}
`

  source = `${page}`

  callback(null, source)

  return undefined
}

export default loader