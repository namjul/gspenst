import type {
  GetPostListQuery,
  GetPostDocumentQuery,
  GetPageListQuery,
  GetPageDocumentQuery,
  GetAuthorListQuery,
  GetAuthorDocumentQuery,
  Page,
  Post,
  Author,
} from '../.tina/__generated__/types'

type GetListQuery = GetPostListQuery | GetPageListQuery | GetAuthorListQuery

type GetDocumentQuery =
  | GetPostDocumentQuery
  | GetPageDocumentQuery
  | GetAuthorDocumentQuery

export type Data = GetListQuery | GetDocumentQuery

export type ThemeOptions = {
  sitePaths?: {
    [name: Scalars['String']]: Scalars['String']
  }
  darkMode?: Scalars['Boolean']
}

export type PageProps = {
  data: Data
  query: string
  variables: { [key: string]: any }
}

export type { Page, Post, Author }
