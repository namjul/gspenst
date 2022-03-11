import type { GetStaticProps, GetStaticPaths } from 'next'
import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import type { Routing } from './types'
import { resolveStaticPaths } from './utils/staticPathResolver'

export const getStaticPaths =
  (routing: Routing, parameter: string): GetStaticPaths =>
  async () => {
    console.log('Page [...slug].js getStaticPaths, routing', routing)

    const client = ExperimentalGetTinaClient() // eslint-disable-line @babel/new-cap
    const { data } = await client.getCollections()

    const paths = resolveStaticPaths(data, routing, parameter)

    console.log('paths: ', JSON.stringify(paths, null, 2))

    return { paths, fallback: false }
  }

export const getStaticProps =
  (routing: Routing, parameter: string): GetStaticProps =>
  async ({ params }) => {
    console.log(
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
