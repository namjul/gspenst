import slugify from 'slugify'
import type { GetCollectionsQuery } from '../../.tina/__generated__/types'
import type { ThemeConfig } from '../types'

const themeOptions: ThemeConfig = {
  sitePaths: {
    author: 'authors',
    post: 'posts',
    page: '',
  },
}

export function resolveStaticPaths(collectionQuery: GetCollectionsQuery) {
  const paths = collectionQuery.getCollections
    .filter(({ name }) => name !== 'config')
    .flatMap(({ documents, name }) => {
      const collectionSlug = themeOptions.sitePaths?.[name] ?? name

      // const collectionPath = collectionSlug
      //   ? [{ params: { name, slug: [collectionSlug] } }]
      //   : []

      const documentPaths = (documents.edges ?? []).flatMap((document) => {
        if (document?.node?.sys) {
          const { filename, relativePath } = document.node.sys

          const slug = [
            ...(collectionSlug ? [collectionSlug] : []),
            slugify(filename),
          ]

          return {
            params: {
              name,
              relativePath,
              slug,
            },
          }
        }

        return []
      })

      return [...documentPaths] as Array<{
        params: { slug: Array<string>; name: string; relativePath?: string }
      }>
    })
  return paths
}
