import type {
  GetPostQuery,
  GetPageQuery,
  GetAuthorQuery,
  GlobalQueryFragmentFragment,
} from '../.tina/__generated__/types'

export type PageDocument = GetPageQuery['getPageDocument']
export type PostDocument = GetPostQuery['getPostDocument']
export type AuthorDocument = GetAuthorQuery['getAuthorDocument']
export type GlobalDocument = GlobalQueryFragmentFragment['getGlobalDocument']

export type Data = GetPostQuery | GetPageQuery | GetAuthorQuery

export type ThemeOptions = {
  sitePaths?: {
    [name: Scalars['String']]: Scalars['String']
  }
  darkMode?: Scalars['Boolean']
}
