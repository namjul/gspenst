import type { GetStaticProps, GetStaticPaths } from 'next'
import { toArray } from '@gspenst/utils'
import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import * as cache from './cache'
import { resolveStaticPaths } from './utils/staticPathResolver'
import { resolveStaticProps } from './utils/staticPropsResolver'

export const getStaticPaths: GetStaticPaths = async () => {
  console.log('Page [...slug].js getStaticPaths')

  const client = ExperimentalGetTinaClient() // eslint-disable-line @babel/new-cap
  const { data } = await client.getCollections()

  const paths = resolveStaticPaths(data)

  console.log('PATHS: ', JSON.stringify(paths, null, 2))

  await cache.setData(
    paths.reduce((acc, { params: { slug, name, relativePath } }) => {
      return { ...acc, [slug.join('/')]: { name, relativePath } }
    }, {})
  )

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  console.log(
    'Page [...slug].js getStaticProps, params: ',
    JSON.stringify(params, null, 2)
  )

  const cacheData = await cache.getData()
  const slug = toArray(params?.slug ?? []).join('/')
  const { name, relativePath } = cacheData[slug] ?? {}

  const client = ExperimentalGetTinaClient() // eslint-disable-line @babel/new-cap

  const data = await (() => {
    switch (name) {
      case 'post':
        return relativePath
          ? client.getPostDocument({ relativePath })
          : client.getPostList()
      case 'page':
        return relativePath
          ? client.getPageDocument({ relativePath })
          : client.getPageList()
      case 'author':
        return relativePath
          ? client.getAuthorDocument({ relativePath })
          : client.getAuthorList()
      default:
        throw new Error(
          'Something went wrong with accessing cached slug data. At leat collection name must exist.'
        )
    }
  })()

  const props = resolveStaticProps(data)

  return { props }
}
