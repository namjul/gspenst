import debug from 'debug'
import type { GetStaticProps, GetStaticPaths } from 'next'
import { resourceMapCache } from './plugin'
import { RouterManager } from './routing'
import type { RoutingConfigResolved } from './validate'
import { resolveStaticProps } from './staticPropsResolver'

const log = debug('@gspenst/next:server')

export const getStaticPaths =
  (routingConfig: RoutingConfigResolved): GetStaticPaths =>
  async () => {
    log('Page [...slug].js getStaticPaths')

    const resources = Object.values(await resourceMapCache.get())
    const router = new RouterManager(routingConfig, resources)

    const paths = await router.resolvePaths()
    return {
      paths,
      fallback: false, // TODO allow for `blocking`
    }
  }

export const getStaticProps =
  (
    routingConfig: RoutingConfigResolved,
    routingParameter: string
  ): GetStaticProps<{}> =>
  async (context) => {
    const { params } = context

    log('Page [...slug].js getStaticProps')

    const resources = Object.values(await resourceMapCache.get())
    const router = new RouterManager(routingConfig, resources)

    const routingProperties = params
      ? await router.handle(params[routingParameter])
      : null

    if (!routingProperties) {
      return {
        notFound: true,
      }
    }

    const props = await resolveStaticProps(routingProperties)
    return { props }
  }
