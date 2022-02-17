import slugify from 'slugify'
import type { GetCollectionsQuery } from '../../.tina/__generated__/types'
import type { ThemeOptions } from '../types'

const themeOptions: ThemeOptions = {
  sitePaths: {
    // authors: 'author',
    // posts: 'post',
    pages: '',
  },
}

export function resolveStaticPaths(collectionQuery: GetCollectionsQuery) {
  const paths = collectionQuery.getCollections.flatMap(({ documents, name }) =>
    (documents.edges ?? []).flatMap((document) => {
      const collectionSlug = themeOptions.sitePaths?.[name] ?? name

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
  )
  return paths
}
