import slugify from 'slugify'
import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import type { Resource } from './types'

// export function getAllPosts(collection: Array<Collection>, type = 'post') {
//   return collection.filter(({ name }) => name === type)
// }

// export function getLocaleFromFilename(name: string) {
//   const localeRegex = /\.([a-zA-Z-]+)?\.(mdx?|jsx?|json)$/
//   const match = name.match(localeRegex)
//   if (match) return match[1]
//   return undefined
// }

export type ResourceItem = {
  id: ID
  filename: string
  path: string
  slug: string
  resource: Resource
}

// const items: ResourceMapItem[] = []
// const fileMap: FileMap = {}
//
// type PathOptions = {
//   [key: string]: any
//   // resource: string
//   // document: Partial<Document>
//   // type: 'index' | 'post' | 'page' | 'author' | 'tag' | null
//   // controller: 'collection' | 'entry' | 'static' | 'channel'
//   // slug: string
//   // path?: string
//   // template?: string
//   // data?: RoutingData
// }
//
// type Paths = {
//   [path: string]: Paths | PathOptions
// }
//
// export type RoutingMap = {
//   paths: Paths
//   redirects?: {
//     source: string
//     destination: string
//     permanent?: boolean
//   }[]
// }

export async function getResources() {
  const client = ExperimentalGetTinaClient() // eslint-disable-line new-cap

  const {
    data: { getCollections: resources },
  } = await client.getResources()

  const result = resources.reduce<ResourceItem[]>((acc, current) => {
    ;(current.documents.edges ?? []).reduce<ResourceItem[]>(
      (posts, connectionEdge) => {
        if (connectionEdge?.node) {
          const {
            id,
            sys: { filename, path: filepath },
          } = connectionEdge.node
          acc.push({
            id,
            filename,
            path: filepath,
            slug: slugify(filename),
            resource: current.name as Resource,
          })
        }
        return posts
      },
      []
    )

    return acc
  }, [])

  return result
}
