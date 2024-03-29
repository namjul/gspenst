import path from 'path'
import yaml from 'js-yaml'
import { type LoaderContext } from 'webpack'
import { Errors } from 'gspenst'
import { build, buildTina } from 'gspenst/server'
import { findContentDir } from './utils'
import { PARAM_REGEX, IS_PRODUCTION } from './constants'
import { type LoaderOptions } from './types'

const contentDir = path.resolve(findContentDir())

// api lookup: https://webpack.js.org/api/loaders/
async function loader(
  context: LoaderContext<LoaderOptions>,
  source: string
): Promise<string | Buffer> {
  context.cacheable(true)
  const options = context.getOptions()
  const { theme, isServer } = options

  if (!theme) {
    context.emitError(new Error('No Gspenst Theme found.'))
  }

  const isLocalTheme = theme.startsWith('.') || theme.startsWith('/') // Relative path instead of a package name
  const layout = isLocalTheme ? path.resolve(theme) : theme

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

  const configResult = await build(yaml.load(source))

  if (isServer && IS_PRODUCTION) {
    // TODO hold on to reference and close when process closes or make it close automatically when parent closes
    await buildTina(process.cwd())
  }

  if (configResult.isErr()) {
    context.emitError(Errors.format(configResult.error))
  }

  const { routesConfig, pageMap } = configResult.isOk()
    ? configResult.value
    : { routesConfig: {}, pageMap: [] }

  const routesConfigStringified = JSON.stringify(routesConfig)

  return `
import { PHASE_PRODUCTION_BUILD, PHASE_EXPORT } from 'next/constants'
import { Errors } from 'gspenst' // TODO remove dependency when importing gspenst
import { getPaths, getProps } from 'gspenst/server'
import { withData as __gspenst_withData__ } from 'gspenst/data'
import __gspenst_layout from '${layout}'


const GSPENST_INTERNAL = Symbol.for('__gspenst_internal__')
const __gspenst_internal__ = ((globalThis)[GSPENST_INTERNAL] ||= Object.create(null))
__gspenst_internal__.Layout = __gspenst_layout
__gspenst_internal__.pageMap = ${JSON.stringify(pageMap)}

const routesConfig = ${routesConfigStringified}
const routingParameter = '${routingParameter}'
const nextPhase = process.env.NEXT_PHASE
const isBuildPhase = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD
const isStaticHTMLExport = !!${options.isStaticHTMLExport}

export const getStaticPaths = async () => {
  const pathResult = await getPaths({ routesConfig })
  if (pathResult.isOk()) {
    const paths = pathResult.value
    return {
      paths,
      fallback: isStaticHTMLExport ? false : 'blocking',
    }
  }

  throw Errors.format(pathResult.error)
}

export const getStaticProps = async ({ params }) => {

  // triggers nextjs to recompute page props
  const timestamp = ${Date.now()}

  const propsResult = await getProps({ routesConfig, isBuildPhase }, params?.[routingParameter])

  if (propsResult.isOk()) {
    const result = await propsResult.value

    if ('redirect' in result) {
      if (!isStaticHTMLExport) {
        return { redirect: result.redirect }
      } else {
       throw Errors.format(Errors.other("Redirect not supported with static export"))
      }
    }

    if (result.props.isErr()) {
      if (result.props.error.type === 'NotFound') {
        return {
          notFound: true,
        }
      }
      throw Errors.format(result.props.error)
    }

    return { props: result.props.value, ...(isStaticHTMLExport ? {} : { revalidate: 10 }) }
  }

  throw Errors.format(propsResult.error)
}

export { default } from '@gspenst/next/layout'
`
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
