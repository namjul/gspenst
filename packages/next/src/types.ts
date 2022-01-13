import type { MetaData } from 'sourcebit'
// import type { Options as MDXOptions } from '@mdx-js/mdx'
import { Dict /*, Unpacked */ } from '@gspenst/utils'

type Plugin = {
  resolve: string
  options: Dict
}

export type Options = {
  theme: string
  themeConfig?: string
  // mdxOptions?: MDXOptions
  sources?: {
    sample: boolean
  }
  plugins?: Plugin[]
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
  id: UniqueId
  relationships?: EntryRelationship
} & MetaData &
  T

export type EntryRelationship<T = Entry> = {
  [key: string]: T[]
}

export type EntryPath = Entry & {
  params: {
    slug: string[]
  }
}

export type PageDef = {
  path: string
  type: string
}

export type CommonPropsDef = {
  [key: string]: { single?: boolean; type: string }
}

export type CacheData = {
  entries: {
    [id: UniqueId]: Entry
  }
  pages: { path: string; id: UniqueId }[]
  props: {
    [propName: string]: Dict | Dict[]
  }
}

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

export type PageProps = { entry?: Entry; props: Dict }
