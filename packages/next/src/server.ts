import type { GetStaticProps, GetStaticPaths } from 'next'
import type { RoutesConfig, LocatorResource, ThemeContext } from 'gspenst'
import { Errors } from 'gspenst'
import { controller, routerManager } from 'gspenst/server'
import { log } from './logger'

export const getStaticPaths =
  (
    routesConfig: RoutesConfig,
    resources: LocatorResource[],
    staticExport: boolean
  ): GetStaticPaths =>
  async () => {
    log('Page [...slug].js getStaticPaths')

    const router = routerManager(routesConfig)
    const paths = router.resolvePaths(resources)
    return {
      paths,
      fallback: staticExport ? false : 'blocking',
    }
  }

export const getStaticProps =
  (
    routesConfig: RoutesConfig,
    routingParameter: string
  ): GetStaticProps<ThemeContext> =>
  async (context) => {
    const { params } = context

    log('Page [...slug].js getStaticProps')

    const router = routerManager(routesConfig)
    const routingContext = router.handle(params?.[routingParameter])
    const controllerResult = controller(routingContext)

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
        throw Errors.format(result.props.error)
      }

      return { props: result.props.value }
    }
    throw Errors.format(controllerResult.error)
  }
