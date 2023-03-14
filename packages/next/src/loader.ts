/* eslint-disable @typescript-eslint/no-invalid-this */

import path from 'path'
import yaml from 'js-yaml'
import  { type LoaderContext } from 'webpack' // eslint-disable-line import/no-extraneous-dependencies
import { Errors } from 'gspenst'
import { init } from 'gspenst/server'
import { findContentDir } from './utils'
import { log } from './logger'
import { PARAM_REGEX, IS_PRODUCTION } from './constants'

export type LoaderOptions = {
  theme: string
  themeConfig?: string
}

const contentDir = path.resolve(findContentDir())

// api lookup: https://webpack.js.org/api/loaders/
async function loader(
  context: LoaderContext<LoaderOptions>,
  source: string
): Promise<string | Buffer> {
  context.cacheable(true)

  log('Run Loader')

  const options = context.getOptions()
  const { theme, themeConfig } = options

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

  if (!IS_PRODUCTION) {
    // Add the entire directory `content` as the dependency
    // so when manually editing the files pages are rebuild
    context.addContextDependency(contentDir)
  }

  const { resourcePath } = context
  const filename = resourcePath.slice(resourcePath.lastIndexOf('/') + 1)
  const routingParameter = (
    (PARAM_REGEX.exec(filename) ?? []) as Array<string | undefined>
  )[1]

  const configResult = await init(yaml.load(source))

  if (configResult.isErr()) {
    context.emitError(Errors.format(configResult.error))
  }

  const { routesConfig, pageMap, resources } = configResult.isOk()
    ? configResult.value
    : { routesConfig: {}, pageMap: [], resources: [] }

  const routesConfigStringified = JSON.stringify(routesConfig)

  // const tinaConfigPath = path.resolve(process.cwd(), '.tina', 'config')

  const imports = `
import { PHASE_PRODUCTION_BUILD, PHASE_EXPORT } from 'next/constants'
import { Errors } from 'gspenst'
import { getPaths, getProps } from 'gspenst/server'
import { withData as __gspenst_withData__ } from 'gspenst/data'
import getComponent from '@gspenst/next/componentRegistry'
import __gspenst_withTheme__ from '${themePath}'
${
  themeConfigPath
    ? `import __gspenst_themeConfig__ from '${themeConfigPath}'`
    : ''
}
`

  const component = `
const pageMap = ${JSON.stringify(pageMap)}
const GspenstThemeComponent = __gspenst_withData__(
  __gspenst_withTheme__(${
    themeConfigPath ? '__gspenst_themeConfig__' : 'null'
  }), {
    pageMap,
  }
)

export default function GspenstLayout (props) {
  return <GspenstThemeComponent {...props} />
}`

  const dataFetchingFunctions = `

const resources = ${JSON.stringify(resources)}
const routesConfig = ${routesConfigStringified}
const routingParameter = '${routingParameter}'
const isStaticExport = process.env.NEXT_PHASE === PHASE_EXPORT
const isBuildPhase = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD

export const getStaticPaths = async () => {
  return {
    paths: getPaths({ routesConfig, resources }),
    fallback: isStaticExport ? false : 'blocking',
  }
}

export const getStaticProps = async ({ params }) => {
  const propsResult = await getProps({ routesConfig, resources, isBuildPhase }, params?.[routingParameter])
  if (propsResult.isOk()) {
    const result = await propsResult.value
    if ('redirect' in result) {
      return { redirect: result.redirect }
    }

    if (result.props.isErr()) {
      if (result.props.error.type === 'NotFound') {
        return {
          notFound: true,
        }
      }
      throw Errors.format(result.props.error)
    }

    return { props: result.props.value, revalidate: 10 }
  }
  throw Errors.format(propsResult.error)
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
