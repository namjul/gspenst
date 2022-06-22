/* eslint-disable @typescript-eslint/no-invalid-this */

import path from 'path'
import yaml from 'js-yaml'
import type { LoaderContext } from 'webpack'
import { parseRoutes } from './domain/routes'
import {
  isProductionBuild,
  findContentDir,
  filterLocatorResources,
} from './helpers'
import { createRoutingMapping } from './domain/resource'
import { format } from './errors'
import defaultRoutes from './defaultRoutes'
import repository from './repository'
import { log } from './logger'

export type LoaderOptions = {
  theme: string
  themeConfig?: string
  staticExport?: boolean
}

const contentDir = path.resolve(findContentDir())

const paramRegExp = /\[\[?\.*(\w*)\]\]?/ // match dynamic routes

// api lookup: https://webpack.js.org/api/loaders/

async function loader(
  context: LoaderContext<LoaderOptions>,
  source: string
): Promise<string | Buffer> {
  context.cacheable(true)

  log('Run Loader')

  const options = context.getOptions()
  const { theme, themeConfig, staticExport } = options

  if (!theme) {
    context.emitError(new Error('No Gspenst Theme found.'))
  }

  let themePath = theme
  let themeConfigPath = themeConfig ?? null

  // Relative path instead of a package name
  if (theme.startsWith('.') || theme.startsWith('/')) {
    themePath = path.resolve(theme)
  }

  if (themeConfigPath) {
    // TODO use https://github.com/sindresorhus/slash
    // https://github.com/preconstruct/preconstruct/pull/435
    themeConfigPath = path.resolve(themeConfigPath)
  }

  if (!isProductionBuild) {
    // Add the entire directory `content` as the dependency
    // so when manually editing the files pages are rebuild
    context.addContextDependency(contentDir)
  }

  const { resourcePath } = context
  const filename = resourcePath.slice(resourcePath.lastIndexOf('/') + 1)
  const routingParameter = (
    (paramRegExp.exec(filename) ?? []) as Array<string | undefined>
  )[1]

  const routesConfigResult = parseRoutes({
    ...defaultRoutes,
    ...(yaml.load(source) as object),
  })

  if (routesConfigResult.isErr()) {
    context.emitError(format(routesConfigResult.error))
  }

  const routesConfig = routesConfigResult.isOk()
    ? routesConfigResult.value[0]!
    : {}

  const collectResult = await repository.collect(routesConfig)

  if (collectResult.isErr()) {
    context.emitError(format(collectResult.error))
  }

  const resources = collectResult.isOk() ? collectResult.value : []

  const locatorResources = resources.filter(filterLocatorResources)

  const routesConfigStringified = JSON.stringify(routesConfig)

  const tinaSchemaPath = path.resolve(process.cwd(), '.tina', 'schema.ts')

  const routingMapping = createRoutingMapping(locatorResources)

  const imports = `
import * as __gspenst_server__ from '@gspenst/next/server'
import GspenstClientPage from '@gspenst/next/client'
import tinaSchema from '${tinaSchemaPath}'
import __gspenst_withTheme__ from '${themePath}'
${
  themeConfigPath
    ? `import __gspenst_themeConfig__ from '${themeConfigPath}'`
    : ''
}
`

  const component = `
const routingMapping = ${JSON.stringify(routingMapping)}
const GspenstLayout = __gspenst_withTheme__(${
    themeConfigPath ? '__gspenst_themeConfig__' : 'null'
  })

export default function GspenstPage (props) {
  return <GspenstClientPage pageProps={props} Component={GspenstLayout} config={{ tinaSchema, routingMapping }} />
}`

  const dataFetchingFunctions = `

const locatorResources = ${JSON.stringify(locatorResources)}
const routesConfig = ${routesConfigStringified}
const isStaticExport = !!${staticExport}
const routingParameter = '${routingParameter}'

export const getStaticPaths = async () => {
  return __gspenst_server__.getStaticPaths(routesConfig, locatorResources, isStaticExport)()
}

export const getStaticProps = async (context) => {
  return __gspenst_server__.getStaticProps(routesConfig, routingParameter)(context)
}
`

  return [imports, component, dataFetchingFunctions].join('\n')
}

export default function syncLoader(
  this: LoaderContext<LoaderOptions>,
  source: string
) {
  const callback = this.async()
  loader(this, source)
    .then((result) => callback(null, result))
    .catch((err: Error) => callback(err))
}
