import slugify from 'slugify'
import type { GetStaticProps, GetStaticPaths } from 'next'
import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import type { Routing } from './types'

export const getStaticPaths =
  (routing: Routing, parameter: string): GetStaticPaths =>
  async () => {
    console.log('Page [...slug].js getStaticPaths, routing', routing)

    const client = ExperimentalGetTinaClient() // eslint-disable-line @babel/new-cap
    const { data } = await client.getCollections()

    const pages = data.getCollections.filter(({ name }) => name === 'pages')

    const pagePaths = pages.flatMap(({ documents }) =>
      (documents.edges ?? []).flatMap((document) => {
        if (document?.node?.sys) {
          const { filename /* , relativePath */ } = document.node.sys

          const slug = [slugify(filename)]

          return {
            params: {
              [parameter]: slug,
            },
          }
        }

        return []
      })
    )

    const paths = [...pagePaths]

    console.log('paths: ', JSON.stringify(paths, null, 2))

    return { paths, fallback: false }
  }

export const getStaticProps: GetStaticProps = async ({ params }) => {
  console.log(
    'Page [...slug].js getStaticProps, params: ',
    JSON.stringify(params, null, 2)
  )

  const props = {
    params,
  }

  return { props }
}
