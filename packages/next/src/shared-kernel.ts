// https://refactoring.guru/smells/primitive-obsession
// http://ddd.fed.wiki.org/view/welcome-visitors/view/domain-driven-design/view/shared-kernel

import { z } from 'zod'
import stringHash from 'fnv1a'
import type { Ok, Err, ResultAsync as ResultAsyncInner } from 'neverthrow'
import {
  LiteralUnion,
  AsyncReturnType,
  Split,
  Entries,
  Simplify,
  SetOptional,
  Get,
  Opaque,
} from 'type-fest'
import type { GspenstError } from './errors'

export {
  ok,
  err,
  okAsync,
  errAsync,
  combine,
  combineWithAllErrors,
} from 'neverthrow'
export { z }

export type ID = Opaque<number, 'ID'>
export const idSchema = z
  .union([z.string(), z.number()])
  .transform(
    (value) => (typeof value === 'string' ? stringHash(value) : value) as ID
  )

export type Result<T> = Ok<T, GspenstError> | Err<never, GspenstError>
export type ResultAsync<T> = ResultAsyncInner<T, GspenstError>
export type Dict<T = any> = Record<string, T>
export type Unpacked<T> = T extends Array<infer U> ? U : T
export type {
  Ok,
  Err,
  LiteralUnion,
  AsyncReturnType,
  Split,
  Entries,
  Simplify,
  Get,
  SetOptional,
}

/* --- MDX --- */

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
