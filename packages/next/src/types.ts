import { Dict } from '@gspenst/utils'
import type { Options as MDXOptions } from '@mdx-js/mdx'
import type { Props } from 'sourcebit-target-next'

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

export type PageProps = Props & { setting: Setting; posts: Post[] }

// import { MdxNode } from "next-mdx"
//
// interface Post
//   extends MdxNode<{
//     title: string
//     date?: string
//     excerpt?: string
//     featured?: boolean
//     image?: string
//     caption?: string
//   }> {
//   readingTime?: {
//     text: string
//     time: number
//     words: number
//     minutes: number
//   }
//   relationships: {
//     author: Author[]
//     category: Category[]
//   }
// }
//
// interface Page
//   extends MdxNode<{
//     title: string
//     excerpt?: string
//   }> {}
//
// interface Author
//   extends MdxNode<{
//     name: string
//     bio?: string
//     picture?: string
//   }> {}
//
// interface Category
//   extends MdxNode<{
//     name: string
//     excerpt?: string
//   }> {}
