import debug from 'debug'
import type { GetStaticProps, GetStaticPaths } from 'next'
import type { RoutingMap } from './utils/routing'
import { resolveStaticPaths } from './utils/staticPathResolver'

const log = debug('@gspenst/next:server')

export const getStaticPaths =
  (routingMap: RoutingMap, parameter: string): GetStaticPaths =>
  async () => {
    log('Page [...slug].js getStaticPaths, routing', routingMap)

    const paths = resolveStaticPaths(routingMap, parameter)

    // log('paths: ', JSON.stringify(paths, null, 2))

    return { paths, fallback: false }
  }

export const getStaticProps =
  (routing: RoutingMap, parameter: string): GetStaticProps =>
  async ({ params }) => {
    log(
      'Page [...slug].js getStaticProps, params: ',
      JSON.stringify(params, null, 2)
    )

    const props = {
      params,
      routing,
      parameter,
    }

    return { props }
  }
