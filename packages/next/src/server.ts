import debug from 'debug'
import { deserializeError } from 'serialize-error'
import type { GetStaticProps, GetStaticPaths } from 'next'
import { RouterManager } from './routing'
import type { RoutingConfigResolved } from './validate'
import type { PageProps } from './controller'
import { controller } from './controller'
import repository from './repository'

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
  (routingConfig: RoutingConfigResolved | ErrorLike): GetStaticPaths =>
  async () => {
    if (isErrorLike(routingConfig)) {
      throw deserializeError(routingConfig)
    } else {
      log('Page [...slug].js getStaticPaths')

      const resources = await repository.getAll()
      const router = new RouterManager(routingConfig, resources)

      const paths = await router.resolvePaths()
      return {
        paths,
        fallback: false, // TODO allow for `blocking`
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

      const resources = await repository.getAll()
      const router = new RouterManager(routingConfig, resources)

      const routingProperties = params
        ? await router.handle(params[routingParameter])
        : null

      const result = await controller(routingProperties)

      if (!result) {
        return {
          notFound: true,
        }
      }

      if ('redirect' in result) {
        return { redirect: result.redirect }
      }

      return { props: result.props }
    }
  }
