import slugify from 'slugify'
import type { GetCollectionsQuery } from '../../.tina/__generated__/types'
import type { ThemeOptions } from '../types'

const themeOptions: ThemeOptions = {
  sitePaths: {
    author: 'authors',
    post: 'posts',
    page: '',
  },
}

export function resolveStaticPaths(collectionQuery: GetCollectionsQuery) {
  const paths = collectionQuery.getCollections
    .filter(({ name }) => name !== 'global')
    .flatMap(({ documents, name }) => {
      const collectionSlug = themeOptions.sitePaths?.[name] ?? name

      const collectionPath = collectionSlug
        ? [{ params: { name, slug: [collectionSlug] } }]
        : []

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

      return [...collectionPath, ...documentPaths] as Array<{
        params: { slug: Array<string>; name: string; relativePath?: string }
      }>
    })
  return paths
}
