import type {
  GetPostsListQuery,
  GetPostsDocumentQuery,
  GetPagesListQuery,
  GetPagesDocumentQuery,
  GetAuthorsListQuery,
  GetAuthorsDocumentQuery,
  Pages,
  Posts,
  Authors,
} from '../.tina/__generated__/types'

type GetListQuery = GetPostsListQuery | GetPagesListQuery | GetAuthorsListQuery

type GetDocumentQuery =
  | GetPostsDocumentQuery
  | GetPagesDocumentQuery
  | GetAuthorsDocumentQuery

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


export type { Pages, Posts, Authors }
