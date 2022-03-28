import type { GetStaticProps, GetStaticPaths } from 'next'
import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import * as cache from './utils/cache'
import { resolveStaticPaths } from './utils/staticPathResolver'
import { resolveStaticProps } from './utils/staticPropsResolver'

type ToArray<T> = T extends any[] ? T : T[]

/**
 * Transforms `arg` into an array if it's not already.
 *
 * @example
 * import { toArray } from "reakit-utils";
 *
 * toArray("a"); // ["a"]
 * toArray(["a"]); // ["a"]
 */
export function toArray<T>(arg: T) {
  if (Array.isArray(arg)) {
    return arg as ToArray<T>
  }
  return (typeof arg === 'undefined' ? [] : [arg]) as ToArray<T>
}

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
  const { name, relativePath } =
    cacheData[toArray(params?.slug).join('/')] ?? {}

  const props = await resolveStaticProps({ name, relativePath })

  if (!props) {
    throw new Error('Something went wrong with resolving static props')
  }

  return { props }
}
