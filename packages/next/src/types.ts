// import type { Options as MDXOptions } from '@mdx-js/mdx'
import { LiteralUnion, AsyncReturnType, Split } from 'type-fest'
import { resourceMapCache } from './plugin'

export type PageProps = {
  tinaQueries: Array<{}>
}

export type ResourceItem = {
  id: ID
  filename: string
  path: string
  slug: string
  resource: ResourceType
  relativePath: string
  data?: any
}

export type ResourceType = 'post' | 'page' | 'author' | 'tag'

export type DataForm = `${ResourceType}.${string}`

export type ResourceMapItem = {}
export type FileMap = {
  [filePath: string]: ResourceMapItem
}

export type Options = {
  theme: string
  resourceMapCache: typeof resourceMapCache
  // themeConfig?: string
  // mdxOptions?: MDXOptions
  // sources?: Source[]
}

// export type RemarkPlugin = Unpacked<
//   Exclude<MDXOptions['remarkPlugins'], undefined>
// >

export type Config = {
  filename: string
  // route: string
  // meta: string
  // pageMap: string
}

export type Entry<T = Record<string, unknown>> = {
  id: ID
} & T

/* ------------------------------ Domain Type ------------------------------ */

export type Article = Entry<{
  title: string
  slug: string
  url: string
  updated: DateTimeString
  created: DateTimeString
  featured: boolean
}>

export type Tag = Entry<{
  name: string
  description: string
  slug: string
  color: string
}>

export type Author = Entry<{
  name: string
  description: string
  slug: string
  thumbnail: string
}>

export type Post = Article

export type Page = Article

export type Setting = Entry<{
  title: string
  description: string
  // navigation: []
}>

/* --- Utils --- */

export type Dict<T = any> = Record<string, T>

export type Unpacked<T> = T extends Array<infer U> ? U : T

export type { LiteralUnion, AsyncReturnType, Split }
