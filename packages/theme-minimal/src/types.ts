import type {
  GetPostQuery,
  GetPageQuery,
  GetAuthorQuery,
  ConfigQueryFragmentFragment,
} from '../.tina/__generated__/types'

export type PageDocument = GetPageQuery['getPageDocument']
export type PostDocument = GetPostQuery['getPostDocument']
export type AuthorDocument = GetAuthorQuery['getAuthorDocument']
export type ConfigDocument = ConfigQueryFragmentFragment['getConfigDocument']

export type Data = GetPostQuery | GetPageQuery | GetAuthorQuery

export type ThemeConfig = ConfigDocument & {
  sitePaths?: {
    [name: Scalars['String']]: Scalars['String']
  }
}
