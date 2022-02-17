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

  if (!name || !relativePath) {
    throw new Error('Something went wrong with accessing cached slug data.')
  }

  const client = ExperimentalGetTinaClient() // eslint-disable-line @babel/new-cap

  const data = await client.getCollectionDocument({ name, relativePath })

  const props = resolveStaticProps(data)

  return { props }
}
