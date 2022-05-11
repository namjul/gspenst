/* eslint-disable @typescript-eslint/no-invalid-this */

import path from 'path'
import yaml from 'js-yaml'
import type { LoaderContext } from 'webpack'
import { parseRoutes } from './domain/routes'
import { findContentDir } from './utils'
import { isProductionBuild } from './helpers'
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

  // lets nextjs know if any data changes to trigger `serverOnlyChanges` event
  // See: https://github.com/vercel/next.js/blob/2ecfa6aec3b2e4b8ebb4b4c8f55df7357b9d3000/packages/next/server/dev/hot-reloader.ts#L732
  // TODO check if files actually changed using hashes
  // TODO replace with collect result, which changes when actual files change
  let effectHotReload = -1

  if (!isProductionBuild) {
    // Add the entire directory `content` as the dependency
    // so when manually editing the files pages are rebuild
    context.addContextDependency(contentDir)
    effectHotReload = Math.random()
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

  const routesConfigStringified = JSON.stringify(routesConfig)

  const tinaSchemaPath = path.resolve(process.cwd(), '.tina', 'schema.ts')

  const imports = `
import { Semaphore } from 'async-mutex'
import * as __gspenst_server__ from '@gspenst/next/server'
import GspenstClientPage from '@gspenst/next/client'
import { tinaConfig } from '${tinaSchemaPath}'
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
  return <GspenstClientPage pageProps={props} Component={GspenstLayout} tinaConfig={tinaConfig} />
}`

  const dataFetchingFunctions = `
const effectHotReload = ${effectHotReload}

const sem = new Semaphore(10)

export const getStaticPaths = async () => {
  return __gspenst_server__.getStaticPaths(${routesConfigStringified}, ${JSON.stringify(
    resources
  )}, !!${staticExport})()
}

export const getStaticProps = async (context) => {
  return __gspenst_server__.getStaticProps(${routesConfigStringified},'${routingParameter}', sem)(context)
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
