//@ts-nocheck
// DO NOT MODIFY THIS FILE. This file is automatically generated by Tina
import { gql } from 'tinacms'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /** References another document, used as a foreign key */
  Reference: any
  JSON: any
}

export type SystemInfo = {
  __typename?: 'SystemInfo'
  filename: Scalars['String']
  basename: Scalars['String']
  breadcrumbs: Array<Scalars['String']>
  path: Scalars['String']
  relativePath: Scalars['String']
  extension: Scalars['String']
  template: Scalars['String']
  collection: Collection
}

export type SystemInfoBreadcrumbsArgs = {
  excludeExtension?: InputMaybe<Scalars['Boolean']>
}

export type PageInfo = {
  __typename?: 'PageInfo'
  hasPreviousPage: Scalars['Boolean']
  hasNextPage: Scalars['Boolean']
  startCursor: Scalars['String']
  endCursor: Scalars['String']
}

export type Node = {
  id: Scalars['ID']
}

export type Document = {
  sys?: Maybe<SystemInfo>
  id: Scalars['ID']
  form: Scalars['JSON']
  values: Scalars['JSON']
}

/** A relay-compliant pagination connection */
export type Connection = {
  totalCount: Scalars['Float']
}

export type Query = {
  __typename?: 'Query'
  getCollection: Collection
  getCollections: Array<Collection>
  node: Node
  getDocument: DocumentNode
  getDocumentList: DocumentConnection
  getDocumentFields: Scalars['JSON']
  getGlobalDocument: GlobalDocument
  getGlobalList: GlobalConnection
  getPostsDocument: PostsDocument
  getPostsList: PostsConnection
  getAuthorsDocument: AuthorsDocument
  getAuthorsList: AuthorsConnection
  getPagesDocument: PagesDocument
  getPagesList: PagesConnection
}

export type QueryGetCollectionArgs = {
  collection?: InputMaybe<Scalars['String']>
}

export type QueryNodeArgs = {
  id?: InputMaybe<Scalars['String']>
}

export type QueryGetDocumentArgs = {
  collection?: InputMaybe<Scalars['String']>
  relativePath?: InputMaybe<Scalars['String']>
}

export type QueryGetDocumentListArgs = {
  before?: InputMaybe<Scalars['String']>
  after?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Float']>
  last?: InputMaybe<Scalars['Float']>
}

export type QueryGetGlobalDocumentArgs = {
  relativePath?: InputMaybe<Scalars['String']>
}

export type QueryGetGlobalListArgs = {
  before?: InputMaybe<Scalars['String']>
  after?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Float']>
  last?: InputMaybe<Scalars['Float']>
}

export type QueryGetPostsDocumentArgs = {
  relativePath?: InputMaybe<Scalars['String']>
}

export type QueryGetPostsListArgs = {
  before?: InputMaybe<Scalars['String']>
  after?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Float']>
  last?: InputMaybe<Scalars['Float']>
}

export type QueryGetAuthorsDocumentArgs = {
  relativePath?: InputMaybe<Scalars['String']>
}

export type QueryGetAuthorsListArgs = {
  before?: InputMaybe<Scalars['String']>
  after?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Float']>
  last?: InputMaybe<Scalars['Float']>
}

export type QueryGetPagesDocumentArgs = {
  relativePath?: InputMaybe<Scalars['String']>
}

export type QueryGetPagesListArgs = {
  before?: InputMaybe<Scalars['String']>
  after?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Float']>
  last?: InputMaybe<Scalars['Float']>
}

export type DocumentConnectionEdges = {
  __typename?: 'DocumentConnectionEdges'
  cursor?: Maybe<Scalars['String']>
  node?: Maybe<DocumentNode>
}

export type DocumentConnection = Connection & {
  __typename?: 'DocumentConnection'
  pageInfo?: Maybe<PageInfo>
  totalCount: Scalars['Float']
  edges?: Maybe<Array<Maybe<DocumentConnectionEdges>>>
}

export type Collection = {
  __typename?: 'Collection'
  name: Scalars['String']
  slug: Scalars['String']
  label?: Maybe<Scalars['String']>
  path: Scalars['String']
  format?: Maybe<Scalars['String']>
  matches?: Maybe<Scalars['String']>
  templates?: Maybe<Array<Maybe<Scalars['JSON']>>>
  fields?: Maybe<Array<Maybe<Scalars['JSON']>>>
  documents: DocumentConnection
}

export type CollectionDocumentsArgs = {
  before?: InputMaybe<Scalars['String']>
  after?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Float']>
  last?: InputMaybe<Scalars['Float']>
}

export type DocumentNode =
  | GlobalDocument
  | PostsDocument
  | AuthorsDocument
  | PagesDocument

export type Global = {
  __typename?: 'Global'
  color?: Maybe<Scalars['String']>
}

export type GlobalDocument = Node &
  Document & {
    __typename?: 'GlobalDocument'
    id: Scalars['ID']
    sys: SystemInfo
    data: Global
    form: Scalars['JSON']
    values: Scalars['JSON']
    dataJSON: Scalars['JSON']
  }

export type GlobalConnectionEdges = {
  __typename?: 'GlobalConnectionEdges'
  cursor?: Maybe<Scalars['String']>
  node?: Maybe<GlobalDocument>
}

export type GlobalConnection = Connection & {
  __typename?: 'GlobalConnection'
  pageInfo?: Maybe<PageInfo>
  totalCount: Scalars['Float']
  edges?: Maybe<Array<Maybe<GlobalConnectionEdges>>>
}

export type PostsAuthorDocument = AuthorsDocument

export type Posts = {
  __typename?: 'Posts'
  title?: Maybe<Scalars['String']>
  heroImg?: Maybe<Scalars['String']>
  excerpt?: Maybe<Scalars['JSON']>
  author?: Maybe<PostsAuthorDocument>
  date?: Maybe<Scalars['String']>
  _body?: Maybe<Scalars['JSON']>
}

export type PostsDocument = Node &
  Document & {
    __typename?: 'PostsDocument'
    id: Scalars['ID']
    sys: SystemInfo
    data: Posts
    form: Scalars['JSON']
    values: Scalars['JSON']
    dataJSON: Scalars['JSON']
  }

export type PostsConnectionEdges = {
  __typename?: 'PostsConnectionEdges'
  cursor?: Maybe<Scalars['String']>
  node?: Maybe<PostsDocument>
}

export type PostsConnection = Connection & {
  __typename?: 'PostsConnection'
  pageInfo?: Maybe<PageInfo>
  totalCount: Scalars['Float']
  edges?: Maybe<Array<Maybe<PostsConnectionEdges>>>
}

export type Authors = {
  __typename?: 'Authors'
  name?: Maybe<Scalars['String']>
  avatar?: Maybe<Scalars['String']>
}

export type AuthorsDocument = Node &
  Document & {
    __typename?: 'AuthorsDocument'
    id: Scalars['ID']
    sys: SystemInfo
    data: Authors
    form: Scalars['JSON']
    values: Scalars['JSON']
    dataJSON: Scalars['JSON']
  }

export type AuthorsConnectionEdges = {
  __typename?: 'AuthorsConnectionEdges'
  cursor?: Maybe<Scalars['String']>
  node?: Maybe<AuthorsDocument>
}

export type AuthorsConnection = Connection & {
  __typename?: 'AuthorsConnection'
  pageInfo?: Maybe<PageInfo>
  totalCount: Scalars['Float']
  edges?: Maybe<Array<Maybe<AuthorsConnectionEdges>>>
}

export type PagesSectionsContent = {
  __typename?: 'PagesSectionsContent'
  body?: Maybe<Scalars['JSON']>
}

export type PagesSections = PagesSectionsContent

export type Pages = {
  __typename?: 'Pages'
  sections?: Maybe<Array<Maybe<PagesSections>>>
}

export type PagesDocument = Node &
  Document & {
    __typename?: 'PagesDocument'
    id: Scalars['ID']
    sys: SystemInfo
    data: Pages
    form: Scalars['JSON']
    values: Scalars['JSON']
    dataJSON: Scalars['JSON']
  }

export type PagesConnectionEdges = {
  __typename?: 'PagesConnectionEdges'
  cursor?: Maybe<Scalars['String']>
  node?: Maybe<PagesDocument>
}

export type PagesConnection = Connection & {
  __typename?: 'PagesConnection'
  pageInfo?: Maybe<PageInfo>
  totalCount: Scalars['Float']
  edges?: Maybe<Array<Maybe<PagesConnectionEdges>>>
}

export type Mutation = {
  __typename?: 'Mutation'
  addPendingDocument: DocumentNode
  updateDocument: DocumentNode
  createDocument: DocumentNode
  updateGlobalDocument: GlobalDocument
  createGlobalDocument: GlobalDocument
  updatePostsDocument: PostsDocument
  createPostsDocument: PostsDocument
  updateAuthorsDocument: AuthorsDocument
  createAuthorsDocument: AuthorsDocument
  updatePagesDocument: PagesDocument
  createPagesDocument: PagesDocument
}

export type MutationAddPendingDocumentArgs = {
  collection: Scalars['String']
  relativePath: Scalars['String']
  template?: InputMaybe<Scalars['String']>
}

export type MutationUpdateDocumentArgs = {
  collection?: InputMaybe<Scalars['String']>
  relativePath: Scalars['String']
  params: DocumentMutation
}

export type MutationCreateDocumentArgs = {
  collection?: InputMaybe<Scalars['String']>
  relativePath: Scalars['String']
  params: DocumentMutation
}

export type MutationUpdateGlobalDocumentArgs = {
  relativePath: Scalars['String']
  params: GlobalMutation
}

export type MutationCreateGlobalDocumentArgs = {
  relativePath: Scalars['String']
  params: GlobalMutation
}

export type MutationUpdatePostsDocumentArgs = {
  relativePath: Scalars['String']
  params: PostsMutation
}

export type MutationCreatePostsDocumentArgs = {
  relativePath: Scalars['String']
  params: PostsMutation
}

export type MutationUpdateAuthorsDocumentArgs = {
  relativePath: Scalars['String']
  params: AuthorsMutation
}

export type MutationCreateAuthorsDocumentArgs = {
  relativePath: Scalars['String']
  params: AuthorsMutation
}

export type MutationUpdatePagesDocumentArgs = {
  relativePath: Scalars['String']
  params: PagesMutation
}

export type MutationCreatePagesDocumentArgs = {
  relativePath: Scalars['String']
  params: PagesMutation
}

export type DocumentMutation = {
  global?: InputMaybe<GlobalMutation>
  posts?: InputMaybe<PostsMutation>
  authors?: InputMaybe<AuthorsMutation>
  pages?: InputMaybe<PagesMutation>
}

export type GlobalMutation = {
  color?: InputMaybe<Scalars['String']>
}

export type PostsMutation = {
  title?: InputMaybe<Scalars['String']>
  heroImg?: InputMaybe<Scalars['String']>
  excerpt?: InputMaybe<Scalars['JSON']>
  author?: InputMaybe<Scalars['String']>
  date?: InputMaybe<Scalars['String']>
  _body?: InputMaybe<Scalars['JSON']>
}

export type AuthorsMutation = {
  name?: InputMaybe<Scalars['String']>
  avatar?: InputMaybe<Scalars['String']>
}

export type PagesSectionsContentMutation = {
  body?: InputMaybe<Scalars['JSON']>
}

export type PagesSectionsMutation = {
  content?: InputMaybe<PagesSectionsContentMutation>
}

export type PagesMutation = {
  sections?: InputMaybe<Array<InputMaybe<PagesSectionsMutation>>>
}

export type PostsDocumentQueryFragmentFragment = {
  __typename?: 'PostsDocument'
  id: string
  data: {
    __typename?: 'Posts'
    title?: string | null
    date?: string | null
    heroImg?: string | null
    excerpt?: any | null
    author?: {
      __typename?: 'AuthorsDocument'
      data: {
        __typename?: 'Authors'
        name?: string | null
        avatar?: string | null
      }
    } | null
  }
}

export type PagesDocumentQueryFragmentFragment = {
  __typename?: 'PagesDocument'
  id: string
}

export type AuthorsDocumentQueryFragmentFragment = {
  __typename?: 'AuthorsDocument'
  id: string
  data: { __typename?: 'Authors'; name?: string | null; avatar?: string | null }
}

export type GetCollectionsQueryVariables = Exact<{ [key: string]: never }>

export type GetCollectionsQuery = {
  __typename: 'Query'
  getCollections: Array<{
    __typename: 'Collection'
    name: string
    slug: string
    path: string
    matches?: string | null
    documents: {
      __typename?: 'DocumentConnection'
      totalCount: number
      edges?: Array<{
        __typename?: 'DocumentConnectionEdges'
        node?:
          | {
              __typename: 'GlobalDocument'
              id: string
              sys: {
                __typename?: 'SystemInfo'
                filename: string
                basename: string
                breadcrumbs: Array<string>
                path: string
                relativePath: string
                extension: string
              }
            }
          | {
              __typename: 'PostsDocument'
              id: string
              sys: {
                __typename?: 'SystemInfo'
                filename: string
                basename: string
                breadcrumbs: Array<string>
                path: string
                relativePath: string
                extension: string
              }
            }
          | {
              __typename: 'AuthorsDocument'
              id: string
              sys: {
                __typename?: 'SystemInfo'
                filename: string
                basename: string
                breadcrumbs: Array<string>
                path: string
                relativePath: string
                extension: string
              }
            }
          | {
              __typename: 'PagesDocument'
              id: string
              sys: {
                __typename?: 'SystemInfo'
                filename: string
                basename: string
                breadcrumbs: Array<string>
                path: string
                relativePath: string
                extension: string
              }
            }
          | null
      } | null> | null
    }
  }>
}

export type GetCollectionDocumentQueryVariables = Exact<{
  relativePath: Scalars['String']
  name: Scalars['String']
}>

export type GetCollectionDocumentQuery = {
  __typename?: 'Query'
  getDocument:
    | { __typename?: 'GlobalDocument' }
    | {
        __typename?: 'PostsDocument'
        id: string
        data: {
          __typename?: 'Posts'
          title?: string | null
          date?: string | null
          heroImg?: string | null
          excerpt?: any | null
          author?: {
            __typename?: 'AuthorsDocument'
            data: {
              __typename?: 'Authors'
              name?: string | null
              avatar?: string | null
            }
          } | null
        }
      }
    | {
        __typename?: 'AuthorsDocument'
        id: string
        data: {
          __typename?: 'Authors'
          name?: string | null
          avatar?: string | null
        }
      }
    | { __typename?: 'PagesDocument'; id: string }
}

export type GetCollectionQueryVariables = Exact<{
  name: Scalars['String']
}>

export type GetCollectionQuery = {
  __typename?: 'Query'
  getCollection: {
    __typename?: 'Collection'
    documents: {
      __typename?: 'DocumentConnection'
      totalCount: number
      edges?: Array<{
        __typename?: 'DocumentConnectionEdges'
        node?:
          | { __typename?: 'GlobalDocument' }
          | {
              __typename?: 'PostsDocument'
              id: string
              data: {
                __typename?: 'Posts'
                title?: string | null
                date?: string | null
                heroImg?: string | null
                excerpt?: any | null
                author?: {
                  __typename?: 'AuthorsDocument'
                  data: {
                    __typename?: 'Authors'
                    name?: string | null
                    avatar?: string | null
                  }
                } | null
              }
            }
          | {
              __typename?: 'AuthorsDocument'
              id: string
              data: {
                __typename?: 'Authors'
                name?: string | null
                avatar?: string | null
              }
            }
          | { __typename?: 'PagesDocument'; id: string }
          | null
      } | null> | null
    }
  }
}

export type GlobalPartsFragment = {
  __typename?: 'Global'
  color?: string | null
}

export type PostsPartsFragment = {
  __typename?: 'Posts'
  title?: string | null
  heroImg?: string | null
  excerpt?: any | null
  date?: string | null
  _body?: any | null
  author?: { __typename?: 'AuthorsDocument'; id: string } | null
}

export type AuthorsPartsFragment = {
  __typename?: 'Authors'
  name?: string | null
  avatar?: string | null
}

export type PagesPartsFragment = {
  __typename?: 'Pages'
  sections?: Array<{
    __typename: 'PagesSectionsContent'
    body?: any | null
  } | null> | null
}

export type GetGlobalDocumentQueryVariables = Exact<{
  relativePath: Scalars['String']
}>

export type GetGlobalDocumentQuery = {
  __typename?: 'Query'
  getGlobalDocument: {
    __typename?: 'GlobalDocument'
    id: string
    sys: {
      __typename?: 'SystemInfo'
      filename: string
      basename: string
      breadcrumbs: Array<string>
      path: string
      relativePath: string
      extension: string
    }
    data: { __typename?: 'Global'; color?: string | null }
  }
}

export type GetGlobalListQueryVariables = Exact<{ [key: string]: never }>

export type GetGlobalListQuery = {
  __typename?: 'Query'
  getGlobalList: {
    __typename?: 'GlobalConnection'
    totalCount: number
    edges?: Array<{
      __typename?: 'GlobalConnectionEdges'
      node?: {
        __typename?: 'GlobalDocument'
        id: string
        sys: {
          __typename?: 'SystemInfo'
          filename: string
          basename: string
          breadcrumbs: Array<string>
          path: string
          relativePath: string
          extension: string
        }
        data: { __typename?: 'Global'; color?: string | null }
      } | null
    } | null> | null
  }
}

export type GetPostsDocumentQueryVariables = Exact<{
  relativePath: Scalars['String']
}>

export type GetPostsDocumentQuery = {
  __typename?: 'Query'
  getPostsDocument: {
    __typename?: 'PostsDocument'
    id: string
    sys: {
      __typename?: 'SystemInfo'
      filename: string
      basename: string
      breadcrumbs: Array<string>
      path: string
      relativePath: string
      extension: string
    }
    data: {
      __typename?: 'Posts'
      title?: string | null
      heroImg?: string | null
      excerpt?: any | null
      date?: string | null
      _body?: any | null
      author?: { __typename?: 'AuthorsDocument'; id: string } | null
    }
  }
}

export type GetPostsListQueryVariables = Exact<{ [key: string]: never }>

export type GetPostsListQuery = {
  __typename?: 'Query'
  getPostsList: {
    __typename?: 'PostsConnection'
    totalCount: number
    edges?: Array<{
      __typename?: 'PostsConnectionEdges'
      node?: {
        __typename?: 'PostsDocument'
        id: string
        sys: {
          __typename?: 'SystemInfo'
          filename: string
          basename: string
          breadcrumbs: Array<string>
          path: string
          relativePath: string
          extension: string
        }
        data: {
          __typename?: 'Posts'
          title?: string | null
          heroImg?: string | null
          excerpt?: any | null
          date?: string | null
          _body?: any | null
          author?: { __typename?: 'AuthorsDocument'; id: string } | null
        }
      } | null
    } | null> | null
  }
}

export type GetAuthorsDocumentQueryVariables = Exact<{
  relativePath: Scalars['String']
}>

export type GetAuthorsDocumentQuery = {
  __typename?: 'Query'
  getAuthorsDocument: {
    __typename?: 'AuthorsDocument'
    id: string
    sys: {
      __typename?: 'SystemInfo'
      filename: string
      basename: string
      breadcrumbs: Array<string>
      path: string
      relativePath: string
      extension: string
    }
    data: {
      __typename?: 'Authors'
      name?: string | null
      avatar?: string | null
    }
  }
}

export type GetAuthorsListQueryVariables = Exact<{ [key: string]: never }>

export type GetAuthorsListQuery = {
  __typename?: 'Query'
  getAuthorsList: {
    __typename?: 'AuthorsConnection'
    totalCount: number
    edges?: Array<{
      __typename?: 'AuthorsConnectionEdges'
      node?: {
        __typename?: 'AuthorsDocument'
        id: string
        sys: {
          __typename?: 'SystemInfo'
          filename: string
          basename: string
          breadcrumbs: Array<string>
          path: string
          relativePath: string
          extension: string
        }
        data: {
          __typename?: 'Authors'
          name?: string | null
          avatar?: string | null
        }
      } | null
    } | null> | null
  }
}

export type GetPagesDocumentQueryVariables = Exact<{
  relativePath: Scalars['String']
}>

export type GetPagesDocumentQuery = {
  __typename?: 'Query'
  getPagesDocument: {
    __typename?: 'PagesDocument'
    id: string
    sys: {
      __typename?: 'SystemInfo'
      filename: string
      basename: string
      breadcrumbs: Array<string>
      path: string
      relativePath: string
      extension: string
    }
    data: {
      __typename?: 'Pages'
      sections?: Array<{
        __typename: 'PagesSectionsContent'
        body?: any | null
      } | null> | null
    }
  }
}

export type GetPagesListQueryVariables = Exact<{ [key: string]: never }>

export type GetPagesListQuery = {
  __typename?: 'Query'
  getPagesList: {
    __typename?: 'PagesConnection'
    totalCount: number
    edges?: Array<{
      __typename?: 'PagesConnectionEdges'
      node?: {
        __typename?: 'PagesDocument'
        id: string
        sys: {
          __typename?: 'SystemInfo'
          filename: string
          basename: string
          breadcrumbs: Array<string>
          path: string
          relativePath: string
          extension: string
        }
        data: {
          __typename?: 'Pages'
          sections?: Array<{
            __typename: 'PagesSectionsContent'
            body?: any | null
          } | null> | null
        }
      } | null
    } | null> | null
  }
}

export const PostsDocumentQueryFragmentFragmentDoc = gql`
  fragment PostsDocumentQueryFragment on PostsDocument {
    id
    data {
      title
      date
      heroImg
      excerpt
      author {
        ... on AuthorsDocument {
          data {
            name
            avatar
          }
        }
      }
    }
  }
`
export const PagesDocumentQueryFragmentFragmentDoc = gql`
  fragment PagesDocumentQueryFragment on PagesDocument {
    id
  }
`
export const AuthorsDocumentQueryFragmentFragmentDoc = gql`
  fragment AuthorsDocumentQueryFragment on AuthorsDocument {
    id
    data {
      name
      avatar
    }
  }
`
export const GlobalPartsFragmentDoc = gql`
  fragment GlobalParts on Global {
    color
  }
`
export const PostsPartsFragmentDoc = gql`
  fragment PostsParts on Posts {
    title
    heroImg
    excerpt
    author {
      ... on Document {
        id
      }
    }
    date
    _body
  }
`
export const AuthorsPartsFragmentDoc = gql`
  fragment AuthorsParts on Authors {
    name
    avatar
  }
`
export const PagesPartsFragmentDoc = gql`
  fragment PagesParts on Pages {
    sections {
      __typename
      ... on PagesSectionsContent {
        body
      }
    }
  }
`
export const GetCollectionsDocument = gql`
  query getCollections {
    __typename
    getCollections {
      __typename
      name
      slug
      path
      matches
      documents {
        totalCount
        edges {
          node {
            __typename
            ... on GlobalDocument {
              id
              sys {
                filename
                basename
                breadcrumbs
                path
                relativePath
                extension
              }
            }
            ... on PostsDocument {
              id
              sys {
                filename
                basename
                breadcrumbs
                path
                relativePath
                extension
              }
            }
            ... on PagesDocument {
              id
              sys {
                filename
                basename
                breadcrumbs
                path
                relativePath
                extension
              }
            }
            ... on AuthorsDocument {
              id
              sys {
                filename
                basename
                breadcrumbs
                path
                relativePath
                extension
              }
            }
          }
        }
      }
    }
  }
`
export const GetCollectionDocumentDocument = gql`
  query getCollectionDocument($relativePath: String!, $name: String!) {
    getDocument(collection: $name, relativePath: $relativePath) {
      ...PostsDocumentQueryFragment
      ...PagesDocumentQueryFragment
      ...AuthorsDocumentQueryFragment
    }
  }
  ${PostsDocumentQueryFragmentFragmentDoc}
  ${PagesDocumentQueryFragmentFragmentDoc}
  ${AuthorsDocumentQueryFragmentFragmentDoc}
`
export const GetCollectionDocument = gql`
  query getCollection($name: String!) {
    getCollection(collection: $name) {
      documents {
        totalCount
        edges {
          node {
            ...PostsDocumentQueryFragment
            ...PagesDocumentQueryFragment
            ...AuthorsDocumentQueryFragment
          }
        }
      }
    }
  }
  ${PostsDocumentQueryFragmentFragmentDoc}
  ${PagesDocumentQueryFragmentFragmentDoc}
  ${AuthorsDocumentQueryFragmentFragmentDoc}
`
export const GetGlobalDocumentDocument = gql`
  query getGlobalDocument($relativePath: String!) {
    getGlobalDocument(relativePath: $relativePath) {
      sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
      data {
        ...GlobalParts
      }
    }
  }
  ${GlobalPartsFragmentDoc}
`
export const GetGlobalListDocument = gql`
  query getGlobalList {
    getGlobalList {
      totalCount
      edges {
        node {
          id
          sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          data {
            ...GlobalParts
          }
        }
      }
    }
  }
  ${GlobalPartsFragmentDoc}
`
export const GetPostsDocumentDocument = gql`
  query getPostsDocument($relativePath: String!) {
    getPostsDocument(relativePath: $relativePath) {
      sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
      data {
        ...PostsParts
      }
    }
  }
  ${PostsPartsFragmentDoc}
`
export const GetPostsListDocument = gql`
  query getPostsList {
    getPostsList {
      totalCount
      edges {
        node {
          id
          sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          data {
            ...PostsParts
          }
        }
      }
    }
  }
  ${PostsPartsFragmentDoc}
`
export const GetAuthorsDocumentDocument = gql`
  query getAuthorsDocument($relativePath: String!) {
    getAuthorsDocument(relativePath: $relativePath) {
      sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
      data {
        ...AuthorsParts
      }
    }
  }
  ${AuthorsPartsFragmentDoc}
`
export const GetAuthorsListDocument = gql`
  query getAuthorsList {
    getAuthorsList {
      totalCount
      edges {
        node {
          id
          sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          data {
            ...AuthorsParts
          }
        }
      }
    }
  }
  ${AuthorsPartsFragmentDoc}
`
export const GetPagesDocumentDocument = gql`
  query getPagesDocument($relativePath: String!) {
    getPagesDocument(relativePath: $relativePath) {
      sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
      data {
        ...PagesParts
      }
    }
  }
  ${PagesPartsFragmentDoc}
`
export const GetPagesListDocument = gql`
  query getPagesList {
    getPagesList {
      totalCount
      edges {
        node {
          id
          sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          data {
            ...PagesParts
          }
        }
      }
    }
  }
  ${PagesPartsFragmentDoc}
`
export type Requester<C = {}> = <R, V>(
  doc: DocumentNode,
  vars?: V,
  options?: C
) => Promise<R>
export function getSdk<C>(requester: Requester<C>) {
  return {
    getCollections(
      variables?: GetCollectionsQueryVariables,
      options?: C
    ): Promise<{
      data: GetCollectionsQuery
      variables: GetCollectionsQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetCollectionsQuery
          variables: GetCollectionsQueryVariables
          query: string
        },
        GetCollectionsQueryVariables
      >(GetCollectionsDocument, variables, options)
    },
    getCollectionDocument(
      variables: GetCollectionDocumentQueryVariables,
      options?: C
    ): Promise<{
      data: GetCollectionDocumentQuery
      variables: GetCollectionDocumentQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetCollectionDocumentQuery
          variables: GetCollectionDocumentQueryVariables
          query: string
        },
        GetCollectionDocumentQueryVariables
      >(GetCollectionDocumentDocument, variables, options)
    },
    getCollection(
      variables: GetCollectionQueryVariables,
      options?: C
    ): Promise<{
      data: GetCollectionQuery
      variables: GetCollectionQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetCollectionQuery
          variables: GetCollectionQueryVariables
          query: string
        },
        GetCollectionQueryVariables
      >(GetCollectionDocument, variables, options)
    },
    getGlobalDocument(
      variables: GetGlobalDocumentQueryVariables,
      options?: C
    ): Promise<{
      data: GetGlobalDocumentQuery
      variables: GetGlobalDocumentQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetGlobalDocumentQuery
          variables: GetGlobalDocumentQueryVariables
          query: string
        },
        GetGlobalDocumentQueryVariables
      >(GetGlobalDocumentDocument, variables, options)
    },
    getGlobalList(
      variables?: GetGlobalListQueryVariables,
      options?: C
    ): Promise<{
      data: GetGlobalListQuery
      variables: GetGlobalListQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetGlobalListQuery
          variables: GetGlobalListQueryVariables
          query: string
        },
        GetGlobalListQueryVariables
      >(GetGlobalListDocument, variables, options)
    },
    getPostsDocument(
      variables: GetPostsDocumentQueryVariables,
      options?: C
    ): Promise<{
      data: GetPostsDocumentQuery
      variables: GetPostsDocumentQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetPostsDocumentQuery
          variables: GetPostsDocumentQueryVariables
          query: string
        },
        GetPostsDocumentQueryVariables
      >(GetPostsDocumentDocument, variables, options)
    },
    getPostsList(
      variables?: GetPostsListQueryVariables,
      options?: C
    ): Promise<{
      data: GetPostsListQuery
      variables: GetPostsListQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetPostsListQuery
          variables: GetPostsListQueryVariables
          query: string
        },
        GetPostsListQueryVariables
      >(GetPostsListDocument, variables, options)
    },
    getAuthorsDocument(
      variables: GetAuthorsDocumentQueryVariables,
      options?: C
    ): Promise<{
      data: GetAuthorsDocumentQuery
      variables: GetAuthorsDocumentQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetAuthorsDocumentQuery
          variables: GetAuthorsDocumentQueryVariables
          query: string
        },
        GetAuthorsDocumentQueryVariables
      >(GetAuthorsDocumentDocument, variables, options)
    },
    getAuthorsList(
      variables?: GetAuthorsListQueryVariables,
      options?: C
    ): Promise<{
      data: GetAuthorsListQuery
      variables: GetAuthorsListQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetAuthorsListQuery
          variables: GetAuthorsListQueryVariables
          query: string
        },
        GetAuthorsListQueryVariables
      >(GetAuthorsListDocument, variables, options)
    },
    getPagesDocument(
      variables: GetPagesDocumentQueryVariables,
      options?: C
    ): Promise<{
      data: GetPagesDocumentQuery
      variables: GetPagesDocumentQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetPagesDocumentQuery
          variables: GetPagesDocumentQueryVariables
          query: string
        },
        GetPagesDocumentQueryVariables
      >(GetPagesDocumentDocument, variables, options)
    },
    getPagesList(
      variables?: GetPagesListQueryVariables,
      options?: C
    ): Promise<{
      data: GetPagesListQuery
      variables: GetPagesListQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetPagesListQuery
          variables: GetPagesListQueryVariables
          query: string
        },
        GetPagesListQueryVariables
      >(GetPagesListDocument, variables, options)
    },
  }
}
export type Sdk = ReturnType<typeof getSdk>

// TinaSDK generated code
import { staticRequest } from 'tinacms'
const requester: (doc: any, vars?: any, options?: any) => Promise<any> = async (
  doc,
  vars,
  _options
) => {
  let data = {}
  try {
    data = await staticRequest({
      query: doc,
      variables: vars,
    })
  } catch (e) {
    // swallow errors related to document creation
    console.warn('Warning: There was an error when fetching data')
    console.warn(e)
  }

  return { data, query: doc, variables: vars || {} }
}

/**
 * @experimental this class can be used but may change in the future
 **/
export const ExperimentalGetTinaClient = () => getSdk(requester)
