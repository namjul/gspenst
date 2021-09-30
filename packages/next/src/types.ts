import type { Options as MDXOptions } from '@mdx-js/mdx'

type Unpacked<T> = T extends Array<infer U> ? U : T

export type Options = {
  theme: string
  themeConfig?: string
  mdxOptions?: MDXOptions
}

export type RemarkPlugin = Unpacked<
  Exclude<MDXOptions['remarkPlugins'], undefined>
>

export type Config = {
  // filename: string
  // route: string
  // meta: string
  // pageMap: string
}
