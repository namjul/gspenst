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
