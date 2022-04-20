import debug from 'debug'
import { deserializeError } from 'serialize-error'
import type { GetStaticProps, GetStaticPaths } from 'next'
import { RouterManager } from './router'
import type { RoutingConfigResolved } from './domain/routes'
import type { PageProps } from './controller'
import { controller } from './controller'
import { formatError } from './helpers'
import resolvePaths from './resolvePaths'

const log = debug('@gspenst/next:server')

// TODO use from `serialize-error` when its released https://github.com/sindresorhus/serialize-error/releases
type ErrorLike = {
  [key: string]: unknown
  name: string
  message: string
  stack: string
  cause?: unknown
  code?: string
}

function isErrorLike(
  value?: RoutingConfigResolved | ErrorLike
): value is ErrorLike {
  return !!(
    value &&
    typeof value === 'object' &&
    'message' in value &&
    'stack' in value
  )
}

export const getStaticPaths =
  (
    routingConfig: RoutingConfigResolved | ErrorLike,
    staticExport: boolean
  ): GetStaticPaths =>
  async () => {
    if (isErrorLike(routingConfig)) {
      throw deserializeError(routingConfig)
    } else {
      log('Page [...slug].js getStaticPaths')

      const paths = await resolvePaths(routingConfig)
      if (paths.isOk()) {
        console.log('PATHS: ', paths)

        return {
          paths: paths.value,
          fallback: staticExport ? false : 'blocking',
        }
      } else {
        throw formatError(paths.error)
      }
    }
  }

export const getStaticProps =
  (
    routingConfig: RoutingConfigResolved | ErrorLike,
    routingParameter: string
  ): GetStaticProps<PageProps> =>
  async (context) => {
    if (isErrorLike(routingConfig)) {
      throw deserializeError(routingConfig)
    } else {
      const { params } = context

      log('Page [...slug].js getStaticProps')

      const router = new RouterManager(routingConfig)

      const routingProperties = await router.handle(params?.[routingParameter])

      const result = await controller(routingProperties)

      if ('redirect' in result) {
        return { redirect: result.redirect }
      }

      if (result.props.isErr()) {
        if (result.props.error.type === 'NotFound') {
          return {
            notFound: true,
          }
        }
        throw formatError(result.props.error)
      }

      return { props: result.props.value }
    }
  }
