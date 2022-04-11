/* eslint-disable @typescript-eslint/no-invalid-this */

import path from 'path'
import debug from 'debug'
import yaml from 'js-yaml'
import type { LoaderDefinition } from 'webpack'
import type { Options } from './types'
import { validate } from './validate'
import { findContentDir } from './utils'
import { formatError } from './errors'

const log = debug('@gspenst/next:loader')

const contentDir = path.resolve(findContentDir())

type LoaderOptions = Options

// api lookup: https://webpack.js.org/api/loaders/

const paramRegExp = /\[\[?\.*(\w*)\]\]?/ // match dynamic routes
const isProductionBuild = process.env.NODE_ENV === 'production'

export const defaultRoutingConfig = {
  routes: {},
  collections: {
    '/': {
      permalink: '/{slug}/',
      template: 'index',
    },
  },
  taxonomies: {
    tag: '/tag/{slug}',
    author: '/author/{slug}',
  },
}

const loader: LoaderDefinition<LoaderOptions> = function loader(source) {
  const callback = this.async()

  this.cacheable(true)

  const options = this.getOptions()
  const {
    theme,
    themeConfig,
    staticExport = process.env.GSPENST_STATIC_EXPORT,
  } = options

  log('Run loader')

  if (!theme) {
    throw new Error('No Gspenst Theme found.') // TODO use `this.emitError`
  }

  let themePath = theme
  let themeConfigPath = themeConfig ?? null

  // Relative path instead of a package name
  if (theme.startsWith('.') || theme.startsWith('/')) {
    themePath = path.resolve(theme)
  }

  if (themeConfigPath) {
    themeConfigPath = path.resolve(themeConfigPath) // TODO use https://github.com/sindresorhus/slash https://github.com/preconstruct/preconstruct/pull/435
  }

  // lets nextjs know if any data changes to trigger `serverOnlyChanges` event
  // See: https://github.com/vercel/next.js/blob/2ecfa6aec3b2e4b8ebb4b4c8f55df7357b9d3000/packages/next/server/dev/hot-reloader.ts#L732
  // TODO check if files actually changed using hashing
  let effectHotReload = -1

  if (!isProductionBuild) {
    // Add the entire directory `content` as the dependency
    // so we when manually editing the files pages are rebuild
    this.addContextDependency(contentDir)
    effectHotReload = Math.random()
  }

  const { resourcePath } = this
  const filename = resourcePath.slice(resourcePath.lastIndexOf('/') + 1)
  const routingParameter = (
    (paramRegExp.exec(filename) ?? []) as Array<string | undefined>
  )[1]

  const routingConfigResult = validate({
    ...defaultRoutingConfig,
    ...(yaml.load(source) as object),
  })

  if (routingConfigResult.isErr()) {
    this.emitWarning(formatError(routingConfigResult.error))
  }

  const routingConfig = routingConfigResult.isOk()
    ? JSON.stringify(routingConfigResult.value[0])
    : serializeError(formatError(routingConfigResult.error))

  const imports = `
import * as __gspenst_server__ from '@gspenst/next/server'
import GspenstClientPage from '@gspenst/next/client'
import __gspenst_withTheme__ from '${themePath}'
${
  themeConfigPath
    ? `import __gspenst_themeConfig__ from '${themeConfigPath}'`
    : ''
}
`

  const component = `
const GspenstLayout = __gspenst_withTheme__(${
    themeConfigPath ? '__gspenst_themeConfig__' : 'null'
  })

export default function GspenstPage (props) {
  return <GspenstClientPage pageProps={props} Component={GspenstLayout} />
}`

  const dataFetchingFunctions = `
const effectHotReload = ${effectHotReload}

export const getStaticPaths = async () => {
  return __gspenst_server__.getStaticPaths(${routingConfig}, !!${staticExport})()
}

export const getStaticProps = async (context) => {
  return __gspenst_server__.getStaticProps(${routingConfig},'${routingParameter}')(context)
}
`

  source = [imports, component, dataFetchingFunctions].join('\n')

  callback(null, source)

  return undefined
}

export default loader

// TODO use `import { serializeError } from 'serialize-error'`
function serializeError(err: Error) {
  return JSON.stringify(err, Object.getOwnPropertyNames(err))
}
