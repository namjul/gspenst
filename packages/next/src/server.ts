import debug from 'debug'
import type { GetStaticProps, GetStaticPaths } from 'next'
import { RouterManager } from './routing'
import type { RoutingConfigResolved } from './validate'
import type { PageProps } from './types'
import { controller } from './controller'
import repository from './repository'

const log = debug('@gspenst/next:server')

export const getStaticPaths =
  (routingConfig: RoutingConfigResolved): GetStaticPaths =>
  async () => {
    log('Page [...slug].js getStaticPaths')

    const resources = await repository.getAll()
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
  ): GetStaticProps<PageProps> =>
  async (context) => {
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
