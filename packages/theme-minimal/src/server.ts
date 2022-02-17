import type { GetStaticProps, GetStaticPaths } from 'next'
import { toArray } from '@gspenst/utils'
import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import * as cache from './cache'
import { resolveStaticPaths } from './utils/staticPathResolver'

export const getStaticPaths: GetStaticPaths = async () => {
  console.log('Page [...slug].js getStaticPaths')

  const client = ExperimentalGetTinaClient() // eslint-disable-line @babel/new-cap
  const { data } = await client.getCollections()

  const paths = resolveStaticPaths(data)

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

  let props

  const client = ExperimentalGetTinaClient() // eslint-disable-line @babel/new-cap

  switch (name) {
    case 'posts':
      if (relativePath) {
        const { data } = await client.getPostsDocument({
          relativePath,
        })
        props = data
      } else {
        const { data } = await client.getPostsList()
        props = data
      }
      break
    case 'pages':
      if (relativePath) {
        const { data } = await client.getPagesDocument({
          relativePath,
        })
        props = data
      } else {
        const { data } = await client.getPagesList()
        props = data
      }
      break
    case 'authors':
      if (relativePath) {
        const { data } = await client.getAuthorsDocument({
          relativePath,
        })
        props = data
      } else {
        const { data } = await client.getAuthorsList()
        props = data
      }
      break

    default:
      throw new Error('Something went wrong with accessing cached slug data.')
  }

  return { props }
}
