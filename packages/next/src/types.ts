// import type { Options as MDXOptions } from '@mdx-js/mdx'
import { LiteralUnion, AsyncReturnType, Split, Entries } from 'type-fest'
import type {} from /* Page, Post, Author, Tag */ '../.tina/__generated__/types'
import { resourceMapCache } from './plugin'

// validate shapes: https://fettblog.eu/typescript-match-the-exact-object-shape/

export type ResourceItem = {
  id: ID
  filename: string
  path: string
  slug: string
  resource: ResourceType
  relativePath: string
}

export type Taxonomies = 'tag' | 'author'

export type ResourceType = 'post' | 'page' | Taxonomies

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
