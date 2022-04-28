import type { GetStaticProps, GetStaticPaths } from 'next'
import { log } from './logger'
import { routerManager } from './router'
import type { RoutingConfigResolved } from './domain/routes'
import type { PageProps } from './controller'
import { controller } from './controller'
import { format } from './errors'

export const getStaticPaths =
  (
    routingConfig: RoutingConfigResolved,
    staticExport: boolean
  ): GetStaticPaths =>
  async () => {
    log('Page [...slug].js getStaticPaths')

    const router = routerManager(routingConfig)
    const paths = await router.resolvePaths()
    if (paths.isOk()) {
      return {
        paths: paths.value,
        fallback: staticExport ? false : 'blocking',
      }
    }
    throw format(paths.error)
  }

export const getStaticProps =
  (
    routingConfig: RoutingConfigResolved,
    routingParameter: string
  ): GetStaticProps<PageProps> =>
  async (context) => {
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
