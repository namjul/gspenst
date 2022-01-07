import util from 'util'
import findCacheDir from 'find-cache-dir'
import fse from 'fs-extra'
import type { ISourcebitPlugin } from 'sourcebit'
import { get } from '@gspenst/utils'
import type { CacheData, PageDef, Entry } from './types'

type SourebitPluginType = ISourcebitPlugin

type Page = CacheData['pages'][0]

export const FILE_CACHE_PATH = findCacheDir({
  name: '@gspenst/next',
  thunk: true,
})?.('sourcebit-nextjs-cache.json') as string

export const name: ISourcebitPlugin['name'] = 'gspenst-target-next'

export const bootstrap: Exclude<
  SourebitPluginType['bootstrap'],
  undefined
> = async () => {
  await fse.remove(FILE_CACHE_PATH)
}

export const transform: Exclude<
  SourebitPluginType['transform'],
  undefined
> = async ({ data }) => {
  const { objects } = data

  const entries = objects.reduce<{ [id: UniqueId]: Entry }>((acc, object) => {
    acc[object.__metadata.id] = {
      id: object.__metadata.id,
      ...object,
    }
    return acc
  }, {})

  const pageDefs: PageDef[] = [
    {
      path: '/{slug}',
      type: 'page',
      // props: {
      //   bla: { single: false, type: 'category' }
      // }
    },
    {
      path: '/{slug}',
      type: 'post',
    },
    {
      path: '/author/{slug}',
      type: 'author',
    },
    {
      path: '/tag/{slug}',
      type: 'tag',
    },
  ]
  const pages = pageDefs.reduce<Page[]>((accum, pageDef) => {
    const pageObjects = objects.filter(
      (object) => object.__metadata.modelName === pageDef.type
    )
    const pathTemplate = pageDef.path || '/{slug}'

    return pageObjects.reduce((acc, pageObject) => {
      try {
        return acc.concat({
          id: pageObject.__metadata.id,
          path: interpolatePagePath(pathTemplate, pageObject),
        })
      } catch (e: unknown) {
        return acc
      }
    }, accum)
  }, [])

  const transformedData: CacheData = {
    entries,
    pages,
  }

  console.log(JSON.stringify(transformedData, null, 2))

  await fse.ensureFile(FILE_CACHE_PATH)
  await fse.writeJson(FILE_CACHE_PATH, transformedData)

  return data
}

function interpolatePagePath(pathTemplate: string, page: {}) {
  const urlPath = pathTemplate.replace(/{([\s\S]+?)}/g, (_, p1: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment -- for unknown reason eslint warns
    const fieldValue = get(page, p1)
    if (!fieldValue || typeof fieldValue !== 'string') {
      throw new Error(
        `page has no value in field '${p1}', page: ${util.inspect(page, {
          depth: 0,
        })}`
      )
    }
    return fieldValue.trim().replace('/', '')
  })

  return `/${urlPath.trim()}`.replace('/', '')
}
