// import type { Options as MDXOptions } from '@mdx-js/mdx'
import { LiteralUnion } from '@gspenst/utils'
import type { ResourceMapCache } from './plugin'

// type Source = {
//   resolve: string
//   options: Dict
// }

export type Resource = 'post' | 'page' | 'author' | 'tag'

export type DataForm = `${Resource}.${string}`

export type DataQuery = {
  resource: Resource
  type: 'read' | 'browse'
  options: {
    slug: string
    filter?: string
    limit?: number | 'all'
    order?: string // '{property} ASC|DSC'
  }
}

export type DataRouter = {
  redirect: boolean
  slug: string
}

export type Data = {
  query: {
    [key in LiteralUnion<Resource, string>]?: DataQuery
  }
  router: {
    [key in Resource]?: DataRouter[]
  }
}

export type ResourceMapItem = {}
export type FileMap = {
  [filePath: string]: ResourceMapItem
}

export type Options = {
  theme: string
  resourceMapCache: ResourceMapCache
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
