import path from 'path'
import debug from 'debug'
import yaml from 'js-yaml'
import type { LoaderDefinition } from 'webpack'
import type { Options } from './types'
import { validate } from './validate'
import { findContentDir } from './utils'

const log = debug('@gspenst/next:loader')

const contentDir = path.resolve(findContentDir())

type LoaderOptions = Options

/* eslint-disable @typescript-eslint/no-invalid-this */

// lookup: https://webpack.js.org/api/loaders/

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
  const { theme, themeConfig } = options

  log('Run loader')

  if (!theme) {
    throw new Error('No Gspenst Theme found.')
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

  const routingConfig = validate({
    ...defaultRoutingConfig,
    ...(yaml.load(source) as any),
  })

  const imports = `
import * as server from '@gspenst/next/server'
import ClientPage from '@gspenst/next/client'
import withLayout from '${themePath}'
${themeConfigPath ? `import themeConfig from '${themeConfigPath}'` : ''}
`

  const component = `export default function GspenstPage (props) {
  return <ClientPage pageProps={props} Component={withLayout(${
    themeConfigPath ? 'themeConfig' : 'null'
  })} />
}`

  const dataFetchingFunctions = `

const effectHotReload = ${effectHotReload}

export const getStaticPaths = async () => {
  return server.getStaticPaths(${JSON.stringify(routingConfig)})()
}

export const getStaticProps = async (context) => {
  return server.getStaticProps(${JSON.stringify(
    routingConfig
  )},'${routingParameter}')(context)
}
`

  source = [imports, component, dataFetchingFunctions].join('\n')

  callback(null, source)

  return undefined
}

export default loader
