import debug from 'debug'
import { deserializeError, isErrorLike } from 'serialize-error'
import type { ErrorLike } from 'serialize-error'
import type { GetStaticProps, GetStaticPaths } from 'next'
import { routerManager } from './router'
import type { RoutingConfigResolved } from './domain/routes'
import type { PageProps } from './controller'
import { controller } from './controller'
import { format } from './errors'
import resolvePaths from './resolvePaths'

const log = debug('@gspenst/next:server')

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
        throw format(paths.error)
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

      const router = routerManager(routingConfig)

      const controllerResult = controller(
        router.handle(params?.[routingParameter])
      )

      if (controllerResult.isOk()) {
        const result = await controllerResult.value
        if ('redirect' in result) {
          return { redirect: result.redirect }
        }

        if (result.props.isErr()) {
          if (result.props.error.type === 'NotFound') {
            return {
              notFound: true,
            }
          }
          throw format(result.props.error)
        }

        return { props: result.props.value }
      }
      throw format(controllerResult.error)
    }
  }
