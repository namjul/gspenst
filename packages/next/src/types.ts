// import type { Options as MDXOptions } from '@mdx-js/mdx'
import { LiteralUnion, AsyncReturnType, Split, Entries } from 'type-fest'
import type {} from /* Page, Post, Author, Tag */ '../.tina/__generated__/types'

// validate shapes: https://fettblog.eu/typescript-match-the-exact-object-shape/

export type Nullish = null | undefined
export type Maybe<T> = T | null

export type ResourceItem = {
  id: ID
  filename: string
  path: string
  slug: string
  resourceType: ResourceType
  relativePath: string
  data: unknown | undefined
}

export type ResourceItemMap = { [id: ID]: ResourceItem }

export type Taxonomies = 'tag' | 'author'

export type QueryType = 'read' | 'browse'

export type QueryOptions = {
  slug: string
  filter?: string
  limit?: number | 'all'
  order?: string // '{property} ASC|DSC'
  // include: string
  // visibility: string
  // status: string
  // page: string
}

export type ResourceType = 'post' | 'page' | Taxonomies

export type DataForm = `${ResourceType}.${string}`

export type ResourceMapItem = {}
export type FileMap = {
  [filePath: string]: ResourceMapItem
}

export type Options = {
  theme: string
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

/* ------------------------------ Domain Type ------------------------------ */

// export type Entry<T = Record<string, unknown>> = {
//   id: ID
// } & T
//
// export type Post = Entry<{
//   title: string
//   slug: string
//   url: string
//   updated: DateTimeString
//   created: DateTimeString
//   featured: boolean
// }>
//
// export type Tag = Entry<{
//   name: string
//   description: string
//   slug: string
//   color: string
// }>
//
// export type Author = Entry<{
//   name: string
//   description: string
//   slug: string
//   thumbnail: string
// }>
//
// export type Page = Post
//
// export type Setting = Entry<{
//   title: string
//   description: string
//   // navigation: []
// }>

/* --- Utils --- */

export type Dict<T = any> = Record<string, T>

export type Unpacked<T> = T extends Array<infer U> ? U : T

export type { LiteralUnion, AsyncReturnType, Split, Entries }
