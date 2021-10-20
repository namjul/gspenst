import { sourcebitDataClient } from 'sourcebit-target-next'
import type { GetStaticPropsContext } from 'next'
import type { Entry } from './types'

// export type NodeFrontMatter = Record<string, unknown>
//
// export type Source = {
//   filepath: string
//   slug: string
//   url?: string
// }
//
// export type SourceData<T = NodeFrontMatter> = {
//   hash: string
//   frontMatter?: T
//   content?: string
// }
//
// export type NodeRelationships<T = Node> = {
//   [sourceName: string]: T[]
// }
//
// export type Node<T = NodeFrontMatter> = Source &
//   SourceData<T> & {
//     mdx: unknown
//     relationships?: NodeRelationships
//   }
//
// export type NodePath = Node & {
//   params: {
//     slug: string[]
//   }
// }

export async function getData<T extends Entry>() {
  return sourcebitDataClient.getData<T>()
}

export async function getEntries<T extends Entry>(
  modelName?: string
): Promise<T[]> {
  let {
    props: { entries = [] },
  } = await getData()

  entries = Array.isArray(entries) ? entries : [entries]

  if (modelName) {
    return entries.filter(
      (entry) => entry.__metadata.modelName === modelName
    ) as T[]
  }

  return entries as T[]
}

export async function getEntry<T extends Entry>(
  modelName: string,
  context: string | GetStaticPropsContext<NodeJS.Dict<string[]>>
): Promise<T | null> {
  const entries = await getEntries()

  if (!entries.length) return null

  const slug =
    typeof context === 'string'
      ? context
      : context.params?.slug
      ? context.params.slug.join('/')
      : ''

  return (entries.find(
    (entry) => entry.__metadata.modelName === modelName && entry.slug === slug
  ) ?? null) as T
}

//
// export async function getPathsRaw(sourceName: string): Promise<NodePath[]> {
//   const nodes = await getNodes(sourceName)
//
//   if (!nodes.length) return []
//
//   return await Promise.all<NodePath>(
//     nodes.map(async (node) => {
//       return {
//         ...node,
//         params: {
//           slug: node.slug.split('/'),
//         },
//       }
//     })
//   )
// }

// export async function getPaths(
//   sourceName: string
// ): Promise<Pick<NodePath, 'params'>[]> {
//   const paths = await getPathsRaw(sourceName)
//   return paths.map(({ params }) => ({ params }))
// }
