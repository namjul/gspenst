import { Ok, Err } from 'neverthrow'
import {
  LiteralUnion,
  AsyncReturnType,
  Split,
  Entries,
  Simplify,
  Get,
} from 'type-fest'
import type {
  Post,
  Page,
  Author,
  Tag,
  Config,
} from '../.tina/__generated__/types'
import type {
  PageResult,
  PostResult,
  TagResult,
  AuthorResult,
  ConfigResult,
} from './api'
import {
  queryTypes,
  taxonomyTypes,
  resourceTypes,
  queryOptions,
  contextTypes,
  routingContextTypes,
} from './constants'
import type { PageProps as InternalPageProps } from './controller'
import type { GspenstError } from './errors'
import type { HeadingsReturn } from './getHeaders'

export type {
  LiteralUnion,
  AsyncReturnType,
  Split,
  Entries,
  Simplify,
  Post,
  Page,
  Author,
  Tag,
  Config,
  Get,
}

export type Result<T> = Ok<T, GspenstError> | Err<never, GspenstError>

export type { TinaTemplate } from 'tinacms'

export type Nullish = null | undefined
export type Optional<T> = NonNullable<T> | undefined | null

// validate shapes: https://fettblog.eu/typescript-match-the-exact-object-shape/
export type ValidateShape<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never

export type ResourceItemMap = { [id: ID]: ResourceItem }
export type Taxonomies = typeof taxonomyTypes[number]
export type QueryType = typeof queryTypes[number]
export type ResourceType = typeof resourceTypes[number]
export type RoutingContextType = typeof routingContextTypes[number]
export type ContextType = typeof contextTypes[number]
export type QueryOptionsObject<T> = ValidateShape<
  T,
  {
    [key in typeof queryOptions[number]]: any
  }
>

export type PageProps = Simplify<
  Exclude<InternalPageProps, { context: 'internal' }> & {}
> & {
  loading: boolean
  headers: Optional<HeadingsReturn>
}

export type Slug = string

type BaseResourceItem = {
  id: ID
  filename: string
  path: string
  relativePath: string
}

export type DynamicVariables = {
  slug: Slug
  year: number
  month: number
  day: number
  primary_tag: Optional<Slug>
  primary_author: Optional<Slug>
}

export type PostResourceItem = Simplify<
  BaseResourceItem & {
    resourceType: Extract<ResourceType, 'post'>
    dataResult?: PostResult
  } & DynamicVariables
>

export type PageResourceItem = Simplify<
  BaseResourceItem & {
    resourceType: Extract<ResourceType, 'page'>
    dataResult?: PageResult
  } & DynamicVariables
>

export type TagResourceItem = Simplify<
  BaseResourceItem & {
    resourceType: Extract<ResourceType, 'tag'>
    dataResult?: TagResult
  } & DynamicVariables
>

export type AuthorResourceItem = Simplify<
  BaseResourceItem & {
    resourceType: Extract<ResourceType, 'author'>
    dataResult?: AuthorResult
  } & DynamicVariables
>

export type ConfigResourceItem = Simplify<
  BaseResourceItem & {
    resourceType: Extract<ResourceType, 'config'>
    dataResult?: ConfigResult
  }
>
export type ResourceItem =
  | PostResourceItem
  | PageResourceItem
  | AuthorResourceItem
  | TagResourceItem
  | ConfigResourceItem

export type QueryOptions = QueryOptionsObject<{
  slug: Slug
  filter: string | Nullish
  limit: number | 'all' | Nullish
  order: string | Nullish // '{property} ASC|DSC'
  // include: string
  // visibility: string
  // status: string
  // page: string
}>

export type DataForm = `${Exclude<ResourceType, 'config'>}.${string}`

export type Options = {
  theme: string
  themeConfig?: string
  // mdxOptions?: MDXOptions
  // sources?: Source[]
}

// export type RemarkPlugin = Unpacked<
//   Exclude<MDXOptions['remarkPlugins'], undefined>
// >

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

// MDX

export interface Text extends Literal {
  type: 'text'
}

export interface Bold extends Text {
  bold: boolean
}

export interface Italic extends Text {
  italic: boolean
}

export interface Underline extends Text {
  underline: boolean
}

export interface Strikethrough extends Text {
  strikethrough: boolean
}

export interface Code extends Text {
  code: boolean
}

export type Leaf = Text &
  Partial<Bold & Italic & Underline & Strikethrough & Code>

export interface Link extends Parent {
  type: 'a'
  url: string
  title: string
  children: Leaf[]
}

export interface Image extends Node {
  type: 'img'
  url: string
  alt: string
  caption: string
}

export interface Paragraph extends Parent {
  type: 'paragraph'
  children: PhrasingContent[]
}

export interface Heading extends Parent {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: PhrasingContent[]
}

export interface Blockquote extends Parent {
  type: 'blockquote'
  children: PhrasingContent[]
}

export interface ListItem extends Parent {
  type: 'li'
  children: PhrasingContent[]
}

export interface List extends Parent {
  type: 'ul' | 'ol'
  children: ListItem[]
}

export interface CodeLine extends Parent {
  type: 'code_line'
  children: Text[]
}

export interface CodeBlock extends Parent {
  type: 'code_block'
  children: CodeLine[]
  lang?: string
}

type PhrasingContentMap = {
  text: Text
  bold: Bold
  code: Code
  italic: Italic
  underline: Underline
  strikethrough: Strikethrough
  link: Link
  image: Image
}

export type BlockContentMap = {
  paragraph: Paragraph
  heading: Heading
  blockquote: Blockquote
  list: List
  code: CodeBlock
}

export type BlockContent = BlockContentMap[keyof BlockContentMap]
export type PhrasingContent = PhrasingContentMap[keyof PhrasingContentMap]

export type Content = BlockContent | PhrasingContent | ListItem | CodeLine

export type Node = { type: string }

export interface NodeParent extends Node {
  children: Node[]
}

export interface Literal extends Node {
  text: string
}

export interface Parent extends NodeParent {
  children: Content[]
}

export interface Root extends Parent {
  type: 'root'
}
