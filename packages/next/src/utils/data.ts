import path from 'path'
import fs from 'fs'
import slugify from 'slugify'
import type { Resource } from '../types'
import { ExperimentalGetTinaClient } from '../../.tina/__generated__/types'

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

export async function getResources() {
  const client = ExperimentalGetTinaClient() // eslint-disable-line @babel/new-cap

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

export const existsSync = (f: string): boolean => {
  try {
    fs.accessSync(f, fs.constants.F_OK)
    return true
  } catch (e: unknown) {
    return false
  }
}

export function findContentDir(dir: string = process.cwd()): string {
  if (existsSync(path.join(dir, 'content'))) return 'content'

  throw new Error(
    "> Couldn't find a `content` directory. Please create one under the project root"
  )
}
