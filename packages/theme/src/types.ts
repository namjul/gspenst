import type {
  GetPostQuery,
  GetPageQuery,
  GetAuthorQuery,
  ConfigQueryFragmentFragment,
  Config,
} from '../.tina/__generated__/types'

export type PageDocument = GetPageQuery['getPageDocument']
export type PostDocument = GetPostQuery['getPostDocument']
export type AuthorDocument = GetAuthorQuery['getAuthorDocument']
export type ConfigDocument = ConfigQueryFragmentFragment['getConfigDocument']

export type Data = GetPostQuery | GetPageQuery | GetAuthorQuery

export type ThemeConfig = Config & {
  sitePaths?: {
    [name: Scalars['String']]: Scalars['String']
  }
}

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

// ==============
