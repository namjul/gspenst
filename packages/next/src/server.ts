import type { GetStaticProps, GetStaticPaths } from 'next'
import type { Semaphore } from 'async-mutex'
import { log } from './logger'
import { routerManager } from './routing'
import type { RoutesConfig } from './domain/routes'
import type { Resource } from './domain/resource'
import type { PageProps } from './controller'
import { controller } from './controller'
import { format } from './errors'

export const getStaticPaths =
  (
    routesConfig: RoutesConfig,
    resources: Resource[],
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
    routingParameter: string,
    sem: Semaphore
  ): GetStaticProps<PageProps> =>
  async (context) => {
    const { params } = context

    log('Page [...slug].js getStaticProps')

    const router = routerManager(routesConfig)

    const controllerResult = controller(
      router.handle(params?.[routingParameter]),
      sem
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
