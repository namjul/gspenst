import { sourcebitDataClient } from 'sourcebit-target-next'
import type { GetStaticPropsContext } from 'next'
import type { Entry, EntryRelationship, EntryPath } from './types'

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

  entries.map(async (entry) => ({
    ...entry,
    relationships: await getEntryRelationships(entry),
  }))

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

  const entry =
    entries.find(
      (_entry) =>
        _entry.__metadata.modelName === modelName && _entry.slug === slug
    ) ?? null

  if (!entry) return null

  return {
    ...entry,
    relationships: await getEntryRelationships(entry),
  } as T
}

async function getEntryRelationships(entry: Entry): Promise<EntryRelationship> {
  const relationships: EntryRelationship = {}

  const modelNames = ['post', 'page', 'author', 'tag']

  for (const fieldName of Object.keys(entry)) {
    if (!modelNames.includes(fieldName)) {
      continue
    }

    const values = entry[fieldName]

    if (!values) {
      continue
    }

    const valueAsArray = Array.isArray(values) ? values : [values]

    // @ts-expect-error -- getEntry can be `null` but we don't care here
    // eslint-disable-next-line no-await-in-loop
    relationships[fieldName] = await Promise.all(
      valueAsArray.map(async (value) => {
        const x = await getEntry(fieldName, String(value))
        return x
      })
    )
  }

  return relationships
}

export async function getPathsRaw(modelName?: string): Promise<EntryPath[]> {
  const entries = await getEntries(modelName)

  if (!entries.length) return []

  return Promise.all<EntryPath>(
    entries.map(async (entry) => {
      return {
        ...entry,
        params: {
          slug: [String(entry.slug)],
        },
      }
    })
  )
}

export async function getPaths(
  modelName?: string
): Promise<Pick<EntryPath, 'params'>[]> {
  const paths = await getPathsRaw(modelName)
  return paths.map(({ params }) => ({ params }))
}
