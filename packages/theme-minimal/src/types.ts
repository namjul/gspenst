import type {
  GetPostQuery,
  GetPageQuery,
  GetAuthorQuery,
  Page,
  Post,
  Author,
  Global,
} from '../.tina/__generated__/types'

export type Data = GetPostQuery | GetPageQuery | GetAuthorQuery

export type ThemeOptions = {
  sitePaths?: {
    [name: Scalars['String']]: Scalars['String']
  }
  darkMode?: Scalars['Boolean']
}

export type PageProps<T> = {
  page: T
  global: Global
}

export type { Page, Post, Author }
