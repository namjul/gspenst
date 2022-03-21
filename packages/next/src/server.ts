import debug from 'debug'
import type { GetStaticProps, GetStaticPaths } from 'next'
import { RouterManager, PageProps } from './utils/routing'
import type { RoutingConfigResolved } from './utils/validate'

const log = debug('@gspenst/next:server')

export const getStaticPaths =
  (routingConfig: RoutingConfigResolved): GetStaticPaths =>
  async () => {
    log('Page [...slug].js getStaticPaths')

    const router = new RouterManager(routingConfig)

    const paths = await router.resolvePaths()
    return {
      paths,
      fallback: false,
    }
  }

export const getStaticProps =
  (
    routingConfig: RoutingConfigResolved,
    routingParameter: string
  ): GetStaticProps<PageProps> =>
  async (context) => {
    const { params } = context

    log('Page [...slug].js getStaticProps')

    const router = new RouterManager(routingConfig)

    const result = params
      ? await router.resolveProps(params[routingParameter])
      : null

    if (!result) {
      return {
        notFound: true,
      }
    }

    return result
  }
