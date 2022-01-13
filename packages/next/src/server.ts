import fse from 'fs-extra'
import type { GetStaticPropsContext } from 'next'
import { toArray } from '@gspenst/utils'
import { FILE_CACHE_PATH } from './sourcebit/targetNext'
import type {
  Entry,
  EntryRelationship,
  EntryPath,
  CacheData,
  PageProps,
} from './types'

// See for possible other data-server utils https://github.com/stackbit-themes/starter-nextjs-theme/blob/e2ea382944a211b36d3c23a071cbe51d724d4b9c/src/utils/data-utils.js

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

export async function getData(): Promise<CacheData> {
  // from https://github.com/stackbit/sourcebit-target-next/blob/master/lib/data-client.js

  // Every time getStaticPaths is called, the page re-imports all required
  // modules causing this singleton to be reconstructed loosing any in
  // memory cache.
  // https://github.com/zeit/next.js/issues/10933
  //
  // For now, we are reading the changes from filesystem until re-import
  // of this module will be fixed: https://github.com/zeit/next.js/issues/10933
  // TODO: FILE_CACHE_PATH won't work if default cache file path
  //   was changed, but also can't access the specified path because
  //   nextjs re-imports the whole module when this method is called

  const cacheFileExists = new Promise<string>((resolve, reject) => {
    const retryDelay = 500
    const maxNumOfRetries = 10
    let numOfRetries = 0
    const checkPathExists = async () => {
      const pathExists = await fse.pathExists(FILE_CACHE_PATH ?? '')
      if (!pathExists && numOfRetries < maxNumOfRetries) {
        numOfRetries += 1
        console.log(
          `error in server.getData(), cache file '${FILE_CACHE_PATH}' was not found, waiting ${retryDelay}ms and retry #${numOfRetries}`
        )
        setTimeout(checkPathExists, retryDelay)
      } else if (pathExists) {
        resolve(FILE_CACHE_PATH as string)
      } else {
        reject(
          new Error(
            `sourcebitDataClient of the sourcebit-target-next plugin did not find '${FILE_CACHE_PATH}' file. Please check that other Sourcebit plugins are executed successfully.`
          )
        )
      }
    }
    void checkPathExists()
  })

  const fileCachePath = await cacheFileExists

  return fse.readJson(fileCachePath)
}

export async function getEntries<T extends Entry>(
  modelName?: string
): Promise<T[]> {
  const data = await getData()

  const entries = Object.values(data.entries)

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
  context: string | GetStaticPropsContext<NodeJS.Dict<string | string[]>>
): Promise<T | null> {
  const entries = await getEntries()

  if (!entries.length) return null

  const slug =
    typeof context === 'string'
      ? context
      : context.params?.slug
      ? toArray(context.params.slug).join('/')
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

  const modelNames = ['post', 'page', 'author', 'tag'] // TODO from cache file

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
          // TODO make field(slug)
          slug: [entry.__metadata.modelName, String(entry.slug)],
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

export async function getAllPaths(): Promise<string[]> {
  const { pages } = await getData()
  return pages.map((page) => page.path).filter(Boolean)
}

export async function getPageProps(
  context: string | GetStaticPropsContext<NodeJS.Dict<string | string[]>>
): Promise<PageProps> {
  const { entries, pages, props } = await getData()

  const slug =
    typeof context === 'string'
      ? context
      : context.params?.slug
      ? toArray(context.params.slug).join('/')
      : ''

  const pagePath = `/${slug}`

  const page = pages.find(({ path }) => path === pagePath)
  const entry = page ? entries[page.id] : undefined
  return { entry, props }
}
