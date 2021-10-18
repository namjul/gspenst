import { Dict } from '@gspenst/utils'
import type { Options as MDXOptions } from '@mdx-js/mdx'

type Unpacked<T> = T extends Array<infer U> ? U : T

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

export type Tag = {
  type: 'tag'
  id: UniqueId
  name: string
  description: string
  slug: string
  color: string
}

export type Author = {
  type: 'author'
  id: UniqueId
  name: string
  title: string
  description: string
  slug: string
  thumbnail: string
}

export type Post = {
  type: 'post'
  id: UniqueId
  title: string
  slug: string
  body: string
  updated: DateTimeString
  created: DateTimeString
  // tags: []
}

export type Page = Exclude<Post, 'type'> & { type: 'page' }

export type Setting = {
  type: 'setting'
  id: UniqueId
  title: string
  name: string
  description: string
  // navigation: []
}
