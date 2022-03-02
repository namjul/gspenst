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
  getPostDocument: PostDocument
  getPostList: PostConnection
  getAuthorDocument: AuthorDocument
  getAuthorList: AuthorConnection
  getPageDocument: PageDocument
  getPageList: PageConnection
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

export type QueryGetPostDocumentArgs = {
  relativePath?: InputMaybe<Scalars['String']>
}

export type QueryGetPostListArgs = {
  before?: InputMaybe<Scalars['String']>
  after?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Float']>
  last?: InputMaybe<Scalars['Float']>
}

export type QueryGetAuthorDocumentArgs = {
  relativePath?: InputMaybe<Scalars['String']>
}

export type QueryGetAuthorListArgs = {
  before?: InputMaybe<Scalars['String']>
  after?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Float']>
  last?: InputMaybe<Scalars['Float']>
}

export type QueryGetPageDocumentArgs = {
  relativePath?: InputMaybe<Scalars['String']>
}

export type QueryGetPageListArgs = {
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
  | PostDocument
  | AuthorDocument
  | PageDocument

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

export type PostAuthorDocument = AuthorDocument

export type Post = {
  __typename?: 'Post'
  title?: Maybe<Scalars['String']>
  heroImg?: Maybe<Scalars['String']>
  excerpt?: Maybe<Scalars['JSON']>
  author?: Maybe<PostAuthorDocument>
  date?: Maybe<Scalars['String']>
  _body?: Maybe<Scalars['JSON']>
}

export type PostDocument = Node &
  Document & {
    __typename?: 'PostDocument'
    id: Scalars['ID']
    sys: SystemInfo
    data: Post
    form: Scalars['JSON']
    values: Scalars['JSON']
    dataJSON: Scalars['JSON']
  }

export type PostConnectionEdges = {
  __typename?: 'PostConnectionEdges'
  cursor?: Maybe<Scalars['String']>
  node?: Maybe<PostDocument>
}

export type PostConnection = Connection & {
  __typename?: 'PostConnection'
  pageInfo?: Maybe<PageInfo>
  totalCount: Scalars['Float']
  edges?: Maybe<Array<Maybe<PostConnectionEdges>>>
}

export type Author = {
  __typename?: 'Author'
  name?: Maybe<Scalars['String']>
  avatar?: Maybe<Scalars['String']>
}

export type AuthorDocument = Node &
  Document & {
    __typename?: 'AuthorDocument'
    id: Scalars['ID']
    sys: SystemInfo
    data: Author
    form: Scalars['JSON']
    values: Scalars['JSON']
    dataJSON: Scalars['JSON']
  }

export type AuthorConnectionEdges = {
  __typename?: 'AuthorConnectionEdges'
  cursor?: Maybe<Scalars['String']>
  node?: Maybe<AuthorDocument>
}

export type AuthorConnection = Connection & {
  __typename?: 'AuthorConnection'
  pageInfo?: Maybe<PageInfo>
  totalCount: Scalars['Float']
  edges?: Maybe<Array<Maybe<AuthorConnectionEdges>>>
}

export type PageSectionsContent = {
  __typename?: 'PageSectionsContent'
  body?: Maybe<Scalars['JSON']>
}

export type PageSections = PageSectionsContent

export type Page = {
  __typename?: 'Page'
  sections?: Maybe<Array<Maybe<PageSections>>>
}

export type PageDocument = Node &
  Document & {
    __typename?: 'PageDocument'
    id: Scalars['ID']
    sys: SystemInfo
    data: Page
    form: Scalars['JSON']
    values: Scalars['JSON']
    dataJSON: Scalars['JSON']
  }

export type PageConnectionEdges = {
  __typename?: 'PageConnectionEdges'
  cursor?: Maybe<Scalars['String']>
  node?: Maybe<PageDocument>
}

export type PageConnection = Connection & {
  __typename?: 'PageConnection'
  pageInfo?: Maybe<PageInfo>
  totalCount: Scalars['Float']
  edges?: Maybe<Array<Maybe<PageConnectionEdges>>>
}

export type Mutation = {
  __typename?: 'Mutation'
  addPendingDocument: DocumentNode
  updateDocument: DocumentNode
  createDocument: DocumentNode
  updateGlobalDocument: GlobalDocument
  createGlobalDocument: GlobalDocument
  updatePostDocument: PostDocument
  createPostDocument: PostDocument
  updateAuthorDocument: AuthorDocument
  createAuthorDocument: AuthorDocument
  updatePageDocument: PageDocument
  createPageDocument: PageDocument
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

export type MutationUpdatePostDocumentArgs = {
  relativePath: Scalars['String']
  params: PostMutation
}

export type MutationCreatePostDocumentArgs = {
  relativePath: Scalars['String']
  params: PostMutation
}

export type MutationUpdateAuthorDocumentArgs = {
  relativePath: Scalars['String']
  params: AuthorMutation
}

export type MutationCreateAuthorDocumentArgs = {
  relativePath: Scalars['String']
  params: AuthorMutation
}

export type MutationUpdatePageDocumentArgs = {
  relativePath: Scalars['String']
  params: PageMutation
}

export type MutationCreatePageDocumentArgs = {
  relativePath: Scalars['String']
  params: PageMutation
}

export type DocumentMutation = {
  global?: InputMaybe<GlobalMutation>
  post?: InputMaybe<PostMutation>
  author?: InputMaybe<AuthorMutation>
  page?: InputMaybe<PageMutation>
}

export type GlobalMutation = {
  color?: InputMaybe<Scalars['String']>
}

export type PostMutation = {
  title?: InputMaybe<Scalars['String']>
  heroImg?: InputMaybe<Scalars['String']>
  excerpt?: InputMaybe<Scalars['JSON']>
  author?: InputMaybe<Scalars['String']>
  date?: InputMaybe<Scalars['String']>
  _body?: InputMaybe<Scalars['JSON']>
}

export type AuthorMutation = {
  name?: InputMaybe<Scalars['String']>
  avatar?: InputMaybe<Scalars['String']>
}

export type PageSectionsContentMutation = {
  body?: InputMaybe<Scalars['JSON']>
}

export type PageSectionsMutation = {
  content?: InputMaybe<PageSectionsContentMutation>
}

export type PageMutation = {
  sections?: InputMaybe<Array<InputMaybe<PageSectionsMutation>>>
}

export type GlobalQueryFragmentFragment = {
  __typename?: 'Query'
  getGlobalDocument: {
    __typename?: 'GlobalDocument'
    id: string
    data: { __typename?: 'Global'; color?: string | null }
  }
}

export type PostDocumentQueryFragmentFragment = {
  __typename: 'PostDocument'
  id: string
  data: {
    __typename?: 'Post'
    title?: string | null
    heroImg?: string | null
    excerpt?: any | null
    date?: string | null
    _body?: any | null
    author?: {
      __typename?: 'AuthorDocument'
      id: string
      data: {
        __typename?: 'Author'
        name?: string | null
        avatar?: string | null
      }
    } | null
  }
}

export type PageDocumentQueryFragmentFragment = {
  __typename: 'PageDocument'
  id: string
  data: {
    __typename?: 'Page'
    sections?: Array<{
      __typename: 'PageSectionsContent'
      body?: any | null
    } | null> | null
  }
}

export type AuthorDocumentQueryFragmentFragment = {
  __typename: 'AuthorDocument'
  id: string
  data: { __typename?: 'Author'; name?: string | null; avatar?: string | null }
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
              __typename: 'PostDocument'
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
              __typename: 'AuthorDocument'
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
              __typename: 'PageDocument'
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

export type GetPostQueryVariables = Exact<{
  relativePath: Scalars['String']
}>

export type GetPostQuery = {
  __typename?: 'Query'
  getPostDocument: {
    __typename: 'PostDocument'
    id: string
    data: {
      __typename?: 'Post'
      title?: string | null
      heroImg?: string | null
      excerpt?: any | null
      date?: string | null
      _body?: any | null
      author?: {
        __typename?: 'AuthorDocument'
        id: string
        data: {
          __typename?: 'Author'
          name?: string | null
          avatar?: string | null
        }
      } | null
    }
  }
  getGlobalDocument: {
    __typename?: 'GlobalDocument'
    id: string
    data: { __typename?: 'Global'; color?: string | null }
  }
}

export type GetPageQueryVariables = Exact<{
  relativePath: Scalars['String']
}>

export type GetPageQuery = {
  __typename?: 'Query'
  getPageDocument: {
    __typename: 'PageDocument'
    id: string
    data: {
      __typename?: 'Page'
      sections?: Array<{
        __typename: 'PageSectionsContent'
        body?: any | null
      } | null> | null
    }
  }
  getGlobalDocument: {
    __typename?: 'GlobalDocument'
    id: string
    data: { __typename?: 'Global'; color?: string | null }
  }
}

export type GetAuthorQueryVariables = Exact<{
  relativePath: Scalars['String']
}>

export type GetAuthorQuery = {
  __typename?: 'Query'
  getAuthorDocument: {
    __typename: 'AuthorDocument'
    id: string
    data: {
      __typename?: 'Author'
      name?: string | null
      avatar?: string | null
    }
  }
  getGlobalDocument: {
    __typename?: 'GlobalDocument'
    id: string
    data: { __typename?: 'Global'; color?: string | null }
  }
}

export type GlobalPartsFragment = {
  __typename?: 'Global'
  color?: string | null
}

export type PostPartsFragment = {
  __typename?: 'Post'
  title?: string | null
  heroImg?: string | null
  excerpt?: any | null
  date?: string | null
  _body?: any | null
  author?: { __typename?: 'AuthorDocument'; id: string } | null
}

export type AuthorPartsFragment = {
  __typename?: 'Author'
  name?: string | null
  avatar?: string | null
}

export type PagePartsFragment = {
  __typename?: 'Page'
  sections?: Array<{
    __typename: 'PageSectionsContent'
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

export type GetPostDocumentQueryVariables = Exact<{
  relativePath: Scalars['String']
}>

export type GetPostDocumentQuery = {
  __typename?: 'Query'
  getPostDocument: {
    __typename?: 'PostDocument'
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
      __typename?: 'Post'
      title?: string | null
      heroImg?: string | null
      excerpt?: any | null
      date?: string | null
      _body?: any | null
      author?: { __typename?: 'AuthorDocument'; id: string } | null
    }
  }
}

export type GetPostListQueryVariables = Exact<{ [key: string]: never }>

export type GetPostListQuery = {
  __typename?: 'Query'
  getPostList: {
    __typename?: 'PostConnection'
    totalCount: number
    edges?: Array<{
      __typename?: 'PostConnectionEdges'
      node?: {
        __typename?: 'PostDocument'
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
          __typename?: 'Post'
          title?: string | null
          heroImg?: string | null
          excerpt?: any | null
          date?: string | null
          _body?: any | null
          author?: { __typename?: 'AuthorDocument'; id: string } | null
        }
      } | null
    } | null> | null
  }
}

export type GetAuthorDocumentQueryVariables = Exact<{
  relativePath: Scalars['String']
}>

export type GetAuthorDocumentQuery = {
  __typename?: 'Query'
  getAuthorDocument: {
    __typename?: 'AuthorDocument'
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
      __typename?: 'Author'
      name?: string | null
      avatar?: string | null
    }
  }
}

export type GetAuthorListQueryVariables = Exact<{ [key: string]: never }>

export type GetAuthorListQuery = {
  __typename?: 'Query'
  getAuthorList: {
    __typename?: 'AuthorConnection'
    totalCount: number
    edges?: Array<{
      __typename?: 'AuthorConnectionEdges'
      node?: {
        __typename?: 'AuthorDocument'
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
          __typename?: 'Author'
          name?: string | null
          avatar?: string | null
        }
      } | null
    } | null> | null
  }
}

export type GetPageDocumentQueryVariables = Exact<{
  relativePath: Scalars['String']
}>

export type GetPageDocumentQuery = {
  __typename?: 'Query'
  getPageDocument: {
    __typename?: 'PageDocument'
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
      __typename?: 'Page'
      sections?: Array<{
        __typename: 'PageSectionsContent'
        body?: any | null
      } | null> | null
    }
  }
}

export type GetPageListQueryVariables = Exact<{ [key: string]: never }>

export type GetPageListQuery = {
  __typename?: 'Query'
  getPageList: {
    __typename?: 'PageConnection'
    totalCount: number
    edges?: Array<{
      __typename?: 'PageConnectionEdges'
      node?: {
        __typename?: 'PageDocument'
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
          __typename?: 'Page'
          sections?: Array<{
            __typename: 'PageSectionsContent'
            body?: any | null
          } | null> | null
        }
      } | null
    } | null> | null
  }
}

export const GlobalPartsFragmentDoc = gql`
  fragment GlobalParts on Global {
    color
  }
`
export const GlobalQueryFragmentFragmentDoc = gql`
  fragment GlobalQueryFragment on Query {
    getGlobalDocument(relativePath: "index.json") {
      id
      data {
        ...GlobalParts
      }
    }
  }
  ${GlobalPartsFragmentDoc}
`
export const PostPartsFragmentDoc = gql`
  fragment PostParts on Post {
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
export const AuthorPartsFragmentDoc = gql`
  fragment AuthorParts on Author {
    name
    avatar
  }
`
export const PostDocumentQueryFragmentFragmentDoc = gql`
  fragment PostDocumentQueryFragment on PostDocument {
    __typename
    id
    data {
      ...PostParts
      author {
        ... on AuthorDocument {
          data {
            ...AuthorParts
          }
        }
      }
    }
  }
  ${PostPartsFragmentDoc}
  ${AuthorPartsFragmentDoc}
`
export const PagePartsFragmentDoc = gql`
  fragment PageParts on Page {
    sections {
      __typename
      ... on PageSectionsContent {
        body
      }
    }
  }
`
export const PageDocumentQueryFragmentFragmentDoc = gql`
  fragment PageDocumentQueryFragment on PageDocument {
    __typename
    id
    data {
      ...PageParts
    }
  }
  ${PagePartsFragmentDoc}
`
export const AuthorDocumentQueryFragmentFragmentDoc = gql`
  fragment AuthorDocumentQueryFragment on AuthorDocument {
    __typename
    id
    data {
      ...AuthorParts
    }
  }
  ${AuthorPartsFragmentDoc}
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
            ... on PostDocument {
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
            ... on PageDocument {
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
            ... on AuthorDocument {
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
export const GetPostDocument = gql`
  query getPost($relativePath: String!) {
    ...GlobalQueryFragment
    getPostDocument(relativePath: $relativePath) {
      ...PostDocumentQueryFragment
    }
  }
  ${GlobalQueryFragmentFragmentDoc}
  ${PostDocumentQueryFragmentFragmentDoc}
`
export const GetPageDocument = gql`
  query getPage($relativePath: String!) {
    ...GlobalQueryFragment
    getPageDocument(relativePath: $relativePath) {
      ...PageDocumentQueryFragment
    }
  }
  ${GlobalQueryFragmentFragmentDoc}
  ${PageDocumentQueryFragmentFragmentDoc}
`
export const GetAuthorDocument = gql`
  query getAuthor($relativePath: String!) {
    ...GlobalQueryFragment
    getAuthorDocument(relativePath: $relativePath) {
      ...AuthorDocumentQueryFragment
    }
  }
  ${GlobalQueryFragmentFragmentDoc}
  ${AuthorDocumentQueryFragmentFragmentDoc}
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
export const GetPostDocumentDocument = gql`
  query getPostDocument($relativePath: String!) {
    getPostDocument(relativePath: $relativePath) {
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
        ...PostParts
      }
    }
  }
  ${PostPartsFragmentDoc}
`
export const GetPostListDocument = gql`
  query getPostList {
    getPostList {
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
            ...PostParts
          }
        }
      }
    }
  }
  ${PostPartsFragmentDoc}
`
export const GetAuthorDocumentDocument = gql`
  query getAuthorDocument($relativePath: String!) {
    getAuthorDocument(relativePath: $relativePath) {
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
        ...AuthorParts
      }
    }
  }
  ${AuthorPartsFragmentDoc}
`
export const GetAuthorListDocument = gql`
  query getAuthorList {
    getAuthorList {
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
            ...AuthorParts
          }
        }
      }
    }
  }
  ${AuthorPartsFragmentDoc}
`
export const GetPageDocumentDocument = gql`
  query getPageDocument($relativePath: String!) {
    getPageDocument(relativePath: $relativePath) {
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
        ...PageParts
      }
    }
  }
  ${PagePartsFragmentDoc}
`
export const GetPageListDocument = gql`
  query getPageList {
    getPageList {
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
            ...PageParts
          }
        }
      }
    }
  }
  ${PagePartsFragmentDoc}
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
    getPost(
      variables: GetPostQueryVariables,
      options?: C
    ): Promise<{
      data: GetPostQuery
      variables: GetPostQueryVariables
      query: string
    }> {
      return requester<
        { data: GetPostQuery; variables: GetPostQueryVariables; query: string },
        GetPostQueryVariables
      >(GetPostDocument, variables, options)
    },
    getPage(
      variables: GetPageQueryVariables,
      options?: C
    ): Promise<{
      data: GetPageQuery
      variables: GetPageQueryVariables
      query: string
    }> {
      return requester<
        { data: GetPageQuery; variables: GetPageQueryVariables; query: string },
        GetPageQueryVariables
      >(GetPageDocument, variables, options)
    },
    getAuthor(
      variables: GetAuthorQueryVariables,
      options?: C
    ): Promise<{
      data: GetAuthorQuery
      variables: GetAuthorQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetAuthorQuery
          variables: GetAuthorQueryVariables
          query: string
        },
        GetAuthorQueryVariables
      >(GetAuthorDocument, variables, options)
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
    getPostDocument(
      variables: GetPostDocumentQueryVariables,
      options?: C
    ): Promise<{
      data: GetPostDocumentQuery
      variables: GetPostDocumentQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetPostDocumentQuery
          variables: GetPostDocumentQueryVariables
          query: string
        },
        GetPostDocumentQueryVariables
      >(GetPostDocumentDocument, variables, options)
    },
    getPostList(
      variables?: GetPostListQueryVariables,
      options?: C
    ): Promise<{
      data: GetPostListQuery
      variables: GetPostListQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetPostListQuery
          variables: GetPostListQueryVariables
          query: string
        },
        GetPostListQueryVariables
      >(GetPostListDocument, variables, options)
    },
    getAuthorDocument(
      variables: GetAuthorDocumentQueryVariables,
      options?: C
    ): Promise<{
      data: GetAuthorDocumentQuery
      variables: GetAuthorDocumentQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetAuthorDocumentQuery
          variables: GetAuthorDocumentQueryVariables
          query: string
        },
        GetAuthorDocumentQueryVariables
      >(GetAuthorDocumentDocument, variables, options)
    },
    getAuthorList(
      variables?: GetAuthorListQueryVariables,
      options?: C
    ): Promise<{
      data: GetAuthorListQuery
      variables: GetAuthorListQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetAuthorListQuery
          variables: GetAuthorListQueryVariables
          query: string
        },
        GetAuthorListQueryVariables
      >(GetAuthorListDocument, variables, options)
    },
    getPageDocument(
      variables: GetPageDocumentQueryVariables,
      options?: C
    ): Promise<{
      data: GetPageDocumentQuery
      variables: GetPageDocumentQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetPageDocumentQuery
          variables: GetPageDocumentQueryVariables
          query: string
        },
        GetPageDocumentQueryVariables
      >(GetPageDocumentDocument, variables, options)
    },
    getPageList(
      variables?: GetPageListQueryVariables,
      options?: C
    ): Promise<{
      data: GetPageListQuery
      variables: GetPageListQueryVariables
      query: string
    }> {
      return requester<
        {
          data: GetPageListQuery
          variables: GetPageListQueryVariables
          query: string
        },
        GetPageListQueryVariables
      >(GetPageListDocument, variables, options)
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
