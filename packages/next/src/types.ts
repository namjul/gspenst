import type { GetCollectionsQuery } from '../.tina/__generated__/types'

export type Collection = GetCollectionsQuery['getCollections'][0]

// import type { Options as MDXOptions } from '@mdx-js/mdx'
// import { Dict /*, Unpacked */ } from '@gspenst/utils'

// type Source = {
//   resolve: string
//   options: Dict
// }

export type RoutingData =
  | `page.${string}`
  | `post.${string}`
  | `author.${string}`
  | `tag.${string}`

export type Routing = {
  routes?: {
    [path: string]:
      | string
      | {
          template: string
          data?: RoutingData
        }
  }
  collections?: {
    [path: string]: {
      permalink: string
    }
  }
  taxonomies?: {
    tag: string
    author: string
  }
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
