import type { MetaData } from 'sourcebit'
import type { Options as MDXOptions } from '@mdx-js/mdx'
import { Dict, Unpacked } from '@gspenst/utils'
import type { Props } from 'sourcebit-target-next'

type Plugin = {
  resolve: string
  options: Dict
}

export type Options = {
  theme: string
  themeConfig?: string
  mdxOptions?: MDXOptions
  sources?: {
    sample: boolean
  }
  plugins?: Plugin[]
}

export type RemarkPlugin = Unpacked<
  Exclude<MDXOptions['remarkPlugins'], undefined>
>

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
  type: 'author'
  name: string
  description: string
  slug: string
  thumbnail: string
}>

export type Post = Article

export type Page = Article

export type Setting = Entry<{
  type: 'setting'
  title: string
  description: string
  // navigation: []
}>

export type PageProps = Partial<Props & { setting: Setting; posts: Post[] }>
