import slugify from 'slugify'
import type { GetCollectionsQuery } from '../../.tina/__generated__/types'
import type { Routing } from '../types'
import { getAllPosts } from './data'

export function resolveStaticPaths(
  collectionQuery: GetCollectionsQuery,
  routing: Routing,
  parameter: string
) {
  const pages = getAllPosts(collectionQuery.getCollections, 'page')

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

  return paths
}
