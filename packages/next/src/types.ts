// import type { Options as MDXOptions } from '@mdx-js/mdx'
import { LiteralUnion, AsyncReturnType, Split, Entries } from 'type-fest'
import type {} from /* Page, Post, Author, Tag */ '../.tina/__generated__/types'
import {
  queryTypes,
  taxonomies,
  resourceTypes,
  queryOptions,
  contextTypes,
} from './constants'

export type Nullish = null | undefined
export type Maybe<T> = T | null

// validate shapes: https://fettblog.eu/typescript-match-the-exact-object-shape/
export type ValidateShape<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never

export type ResourceItemMap = { [id: ID]: ResourceItem }
export type Taxonomies = typeof taxonomies[number]
export type QueryType = typeof queryTypes[number]
export type ResourceType = typeof resourceTypes[number]
export type ContextType = typeof contextTypes[number]
export type QueryOptionsObject<T> = ValidateShape<
  T,
  {
    [key in typeof queryOptions[number]]: any
  }
>

export type ResourceItem = {
  id: ID
  filename: string
  path: string
  slug: string
  resourceType: ResourceType
  relativePath: string
  data: unknown | undefined
}

export type QueryOptions = QueryOptionsObject<{
  slug: string
  filter: string | Nullish
  limit: number | 'all' | Nullish
  order: string | Nullish // '{property} ASC|DSC'
  // include: string
  // visibility: string
  // status: string
  // page: string
}>

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
