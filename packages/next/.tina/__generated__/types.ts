//@ts-nocheck
// DO NOT MODIFY THIS FILE. This file is automatically generated by Tina
import { gql } from 'tinacms';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** References another document, used as a foreign key */
  Reference: any;
  JSON: any;
};

export type SystemInfo = {
  __typename?: 'SystemInfo';
  filename: Scalars['String'];
  basename: Scalars['String'];
  breadcrumbs: Array<Scalars['String']>;
  path: Scalars['String'];
  relativePath: Scalars['String'];
  extension: Scalars['String'];
  template: Scalars['String'];
  collection: Collection;
};


export type SystemInfoBreadcrumbsArgs = {
  excludeExtension?: InputMaybe<Scalars['Boolean']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  hasPreviousPage: Scalars['Boolean'];
  hasNextPage: Scalars['Boolean'];
  startCursor: Scalars['String'];
  endCursor: Scalars['String'];
};

export type Node = {
  id: Scalars['ID'];
};

export type Document = {
  sys?: Maybe<SystemInfo>;
  id: Scalars['ID'];
  form: Scalars['JSON'];
  values: Scalars['JSON'];
};

/** A relay-compliant pagination connection */
export type Connection = {
  totalCount: Scalars['Float'];
};

export type Query = {
  __typename?: 'Query';
  getCollection: Collection;
  getCollections: Array<Collection>;
  node: Node;
  getDocument: DocumentNode;
  getDocumentList: DocumentConnection;
  getDocumentFields: Scalars['JSON'];
  getConfigDocument: ConfigDocument;
  getConfigList: ConfigConnection;
  getPostDocument: PostDocument;
  getPostList: PostConnection;
  getAuthorDocument: AuthorDocument;
  getAuthorList: AuthorConnection;
  getPageDocument: PageDocument;
  getPageList: PageConnection;
};


export type QueryGetCollectionArgs = {
  collection?: InputMaybe<Scalars['String']>;
};


export type QueryNodeArgs = {
  id?: InputMaybe<Scalars['String']>;
};


export type QueryGetDocumentArgs = {
  collection?: InputMaybe<Scalars['String']>;
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryGetDocumentListArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
};


export type QueryGetConfigDocumentArgs = {
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryGetConfigListArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
};


export type QueryGetPostDocumentArgs = {
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryGetPostListArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
};


export type QueryGetAuthorDocumentArgs = {
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryGetAuthorListArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
};


export type QueryGetPageDocumentArgs = {
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryGetPageListArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
};

export type DocumentConnectionEdges = {
  __typename?: 'DocumentConnectionEdges';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<DocumentNode>;
};

export type DocumentConnection = Connection & {
  __typename?: 'DocumentConnection';
  pageInfo?: Maybe<PageInfo>;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<DocumentConnectionEdges>>>;
};

export type Collection = {
  __typename?: 'Collection';
  name: Scalars['String'];
  slug: Scalars['String'];
  label?: Maybe<Scalars['String']>;
  path: Scalars['String'];
  format?: Maybe<Scalars['String']>;
  matches?: Maybe<Scalars['String']>;
  templates?: Maybe<Array<Maybe<Scalars['JSON']>>>;
  fields?: Maybe<Array<Maybe<Scalars['JSON']>>>;
  documents: DocumentConnection;
};


export type CollectionDocumentsArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
};

export type DocumentNode = ConfigDocument | PostDocument | AuthorDocument | PageDocument;

export type Config = {
  __typename?: 'Config';
  darkMode?: Maybe<Scalars['Boolean']>;
};

export type ConfigDocument = Node & Document & {
  __typename?: 'ConfigDocument';
  id: Scalars['ID'];
  sys: SystemInfo;
  data: Config;
  form: Scalars['JSON'];
  values: Scalars['JSON'];
  dataJSON: Scalars['JSON'];
};

export type ConfigConnectionEdges = {
  __typename?: 'ConfigConnectionEdges';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<ConfigDocument>;
};

export type ConfigConnection = Connection & {
  __typename?: 'ConfigConnection';
  pageInfo?: Maybe<PageInfo>;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<ConfigConnectionEdges>>>;
};

export type PostAuthorDocument = AuthorDocument;

export type Post = {
  __typename?: 'Post';
  title?: Maybe<Scalars['String']>;
  heroImg?: Maybe<Scalars['String']>;
  excerpt?: Maybe<Scalars['JSON']>;
  author?: Maybe<PostAuthorDocument>;
  date?: Maybe<Scalars['String']>;
  body?: Maybe<Scalars['JSON']>;
};

export type PostDocument = Node & Document & {
  __typename?: 'PostDocument';
  id: Scalars['ID'];
  sys: SystemInfo;
  data: Post;
  form: Scalars['JSON'];
  values: Scalars['JSON'];
  dataJSON: Scalars['JSON'];
};

export type PostConnectionEdges = {
  __typename?: 'PostConnectionEdges';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<PostDocument>;
};

export type PostConnection = Connection & {
  __typename?: 'PostConnection';
  pageInfo?: Maybe<PageInfo>;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<PostConnectionEdges>>>;
};

export type Author = {
  __typename?: 'Author';
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  avatar?: Maybe<Scalars['String']>;
};

export type AuthorDocument = Node & Document & {
  __typename?: 'AuthorDocument';
  id: Scalars['ID'];
  sys: SystemInfo;
  data: Author;
  form: Scalars['JSON'];
  values: Scalars['JSON'];
  dataJSON: Scalars['JSON'];
};

export type AuthorConnectionEdges = {
  __typename?: 'AuthorConnectionEdges';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<AuthorDocument>;
};

export type AuthorConnection = Connection & {
  __typename?: 'AuthorConnection';
  pageInfo?: Maybe<PageInfo>;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<AuthorConnectionEdges>>>;
};

export type Page = {
  __typename?: 'Page';
  title?: Maybe<Scalars['String']>;
  body?: Maybe<Scalars['JSON']>;
};

export type PageDocument = Node & Document & {
  __typename?: 'PageDocument';
  id: Scalars['ID'];
  sys: SystemInfo;
  data: Page;
  form: Scalars['JSON'];
  values: Scalars['JSON'];
  dataJSON: Scalars['JSON'];
};

export type PageConnectionEdges = {
  __typename?: 'PageConnectionEdges';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<PageDocument>;
};

export type PageConnection = Connection & {
  __typename?: 'PageConnection';
  pageInfo?: Maybe<PageInfo>;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<PageConnectionEdges>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addPendingDocument: DocumentNode;
  updateDocument: DocumentNode;
  createDocument: DocumentNode;
  updateConfigDocument: ConfigDocument;
  createConfigDocument: ConfigDocument;
  updatePostDocument: PostDocument;
  createPostDocument: PostDocument;
  updateAuthorDocument: AuthorDocument;
  createAuthorDocument: AuthorDocument;
  updatePageDocument: PageDocument;
  createPageDocument: PageDocument;
};


export type MutationAddPendingDocumentArgs = {
  collection: Scalars['String'];
  relativePath: Scalars['String'];
  template?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateDocumentArgs = {
  collection?: InputMaybe<Scalars['String']>;
  relativePath: Scalars['String'];
  params: DocumentMutation;
};


export type MutationCreateDocumentArgs = {
  collection?: InputMaybe<Scalars['String']>;
  relativePath: Scalars['String'];
  params: DocumentMutation;
};


export type MutationUpdateConfigDocumentArgs = {
  relativePath: Scalars['String'];
  params: ConfigMutation;
};


export type MutationCreateConfigDocumentArgs = {
  relativePath: Scalars['String'];
  params: ConfigMutation;
};


export type MutationUpdatePostDocumentArgs = {
  relativePath: Scalars['String'];
  params: PostMutation;
};


export type MutationCreatePostDocumentArgs = {
  relativePath: Scalars['String'];
  params: PostMutation;
};


export type MutationUpdateAuthorDocumentArgs = {
  relativePath: Scalars['String'];
  params: AuthorMutation;
};


export type MutationCreateAuthorDocumentArgs = {
  relativePath: Scalars['String'];
  params: AuthorMutation;
};


export type MutationUpdatePageDocumentArgs = {
  relativePath: Scalars['String'];
  params: PageMutation;
};


export type MutationCreatePageDocumentArgs = {
  relativePath: Scalars['String'];
  params: PageMutation;
};

export type DocumentMutation = {
  config?: InputMaybe<ConfigMutation>;
  post?: InputMaybe<PostMutation>;
  author?: InputMaybe<AuthorMutation>;
  page?: InputMaybe<PageMutation>;
};

export type ConfigMutation = {
  darkMode?: InputMaybe<Scalars['Boolean']>;
};

export type PostMutation = {
  title?: InputMaybe<Scalars['String']>;
  heroImg?: InputMaybe<Scalars['String']>;
  excerpt?: InputMaybe<Scalars['JSON']>;
  author?: InputMaybe<Scalars['String']>;
  date?: InputMaybe<Scalars['String']>;
  body?: InputMaybe<Scalars['JSON']>;
};

export type AuthorMutation = {
  name?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  avatar?: InputMaybe<Scalars['String']>;
};

export type PageMutation = {
  title?: InputMaybe<Scalars['String']>;
  body?: InputMaybe<Scalars['JSON']>;
};

export type ConfigQueryFragmentFragment = { __typename?: 'Query', getConfigDocument: { __typename?: 'ConfigDocument', id: string, data: { __typename?: 'Config', darkMode?: boolean | null } } };

export type PostDocumentQueryFragmentFragment = { __typename: 'PostDocument', id: string, data: { __typename?: 'Post', title?: string | null, heroImg?: string | null, excerpt?: any | null, date?: string | null, body?: any | null, author?: { __typename?: 'AuthorDocument', id: string, data: { __typename?: 'Author', name?: string | null, title?: string | null, avatar?: string | null } } | null } };

export type PageDocumentQueryFragmentFragment = { __typename: 'PageDocument', id: string, data: { __typename?: 'Page', title?: string | null, body?: any | null } };

export type AuthorDocumentQueryFragmentFragment = { __typename: 'AuthorDocument', id: string, data: { __typename?: 'Author', name?: string | null, title?: string | null, avatar?: string | null } };

export type GetResourcesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetResourcesQuery = { __typename: 'Query', getCollections: Array<{ __typename: 'Collection', name: string, slug: string, path: string, matches?: string | null, documents: { __typename?: 'DocumentConnection', totalCount: number, edges?: Array<{ __typename?: 'DocumentConnectionEdges', node?: { __typename: 'ConfigDocument', id: string, sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string } } | { __typename: 'PostDocument', id: string, sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string } } | { __typename: 'AuthorDocument', id: string, sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string } } | { __typename: 'PageDocument', id: string, sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string } } | null } | null> | null } }>, getConfigDocument: { __typename?: 'ConfigDocument', id: string, data: { __typename?: 'Config', darkMode?: boolean | null } } };

export type GetPostQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type GetPostQuery = { __typename?: 'Query', getPostDocument: { __typename: 'PostDocument', id: string, data: { __typename?: 'Post', title?: string | null, heroImg?: string | null, excerpt?: any | null, date?: string | null, body?: any | null, author?: { __typename?: 'AuthorDocument', id: string, data: { __typename?: 'Author', name?: string | null, title?: string | null, avatar?: string | null } } | null } }, getConfigDocument: { __typename?: 'ConfigDocument', id: string, data: { __typename?: 'Config', darkMode?: boolean | null } } };

export type GetPageQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type GetPageQuery = { __typename?: 'Query', getPageDocument: { __typename: 'PageDocument', id: string, data: { __typename?: 'Page', title?: string | null, body?: any | null } }, getConfigDocument: { __typename?: 'ConfigDocument', id: string, data: { __typename?: 'Config', darkMode?: boolean | null } } };

export type GetAuthorQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type GetAuthorQuery = { __typename?: 'Query', getAuthorDocument: { __typename: 'AuthorDocument', id: string, data: { __typename?: 'Author', name?: string | null, title?: string | null, avatar?: string | null } }, getConfigDocument: { __typename?: 'ConfigDocument', id: string, data: { __typename?: 'Config', darkMode?: boolean | null } } };

export type ConfigPartsFragment = { __typename?: 'Config', darkMode?: boolean | null };

export type PostPartsFragment = { __typename?: 'Post', title?: string | null, heroImg?: string | null, excerpt?: any | null, date?: string | null, body?: any | null, author?: { __typename?: 'AuthorDocument', id: string } | null };

export type AuthorPartsFragment = { __typename?: 'Author', name?: string | null, title?: string | null, avatar?: string | null };

export type PagePartsFragment = { __typename?: 'Page', title?: string | null, body?: any | null };

export type GetConfigDocumentQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type GetConfigDocumentQuery = { __typename?: 'Query', getConfigDocument: { __typename?: 'ConfigDocument', id: string, sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, data: { __typename?: 'Config', darkMode?: boolean | null } } };

export type GetConfigListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConfigListQuery = { __typename?: 'Query', getConfigList: { __typename?: 'ConfigConnection', totalCount: number, edges?: Array<{ __typename?: 'ConfigConnectionEdges', node?: { __typename?: 'ConfigDocument', id: string, sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, data: { __typename?: 'Config', darkMode?: boolean | null } } | null } | null> | null } };

export type GetPostDocumentQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type GetPostDocumentQuery = { __typename?: 'Query', getPostDocument: { __typename?: 'PostDocument', id: string, sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, data: { __typename?: 'Post', title?: string | null, heroImg?: string | null, excerpt?: any | null, date?: string | null, body?: any | null, author?: { __typename?: 'AuthorDocument', id: string } | null } } };

export type GetPostListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPostListQuery = { __typename?: 'Query', getPostList: { __typename?: 'PostConnection', totalCount: number, edges?: Array<{ __typename?: 'PostConnectionEdges', node?: { __typename?: 'PostDocument', id: string, sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, data: { __typename?: 'Post', title?: string | null, heroImg?: string | null, excerpt?: any | null, date?: string | null, body?: any | null, author?: { __typename?: 'AuthorDocument', id: string } | null } } | null } | null> | null } };

export type GetAuthorDocumentQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type GetAuthorDocumentQuery = { __typename?: 'Query', getAuthorDocument: { __typename?: 'AuthorDocument', id: string, sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, data: { __typename?: 'Author', name?: string | null, title?: string | null, avatar?: string | null } } };

export type GetAuthorListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAuthorListQuery = { __typename?: 'Query', getAuthorList: { __typename?: 'AuthorConnection', totalCount: number, edges?: Array<{ __typename?: 'AuthorConnectionEdges', node?: { __typename?: 'AuthorDocument', id: string, sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, data: { __typename?: 'Author', name?: string | null, title?: string | null, avatar?: string | null } } | null } | null> | null } };

export type GetPageDocumentQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type GetPageDocumentQuery = { __typename?: 'Query', getPageDocument: { __typename?: 'PageDocument', id: string, sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, data: { __typename?: 'Page', title?: string | null, body?: any | null } } };

export type GetPageListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPageListQuery = { __typename?: 'Query', getPageList: { __typename?: 'PageConnection', totalCount: number, edges?: Array<{ __typename?: 'PageConnectionEdges', node?: { __typename?: 'PageDocument', id: string, sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, data: { __typename?: 'Page', title?: string | null, body?: any | null } } | null } | null> | null } };

export const ConfigPartsFragmentDoc = gql`
    fragment ConfigParts on Config {
  darkMode
}
    `;
export const ConfigQueryFragmentFragmentDoc = gql`
    fragment ConfigQueryFragment on Query {
  getConfigDocument(relativePath: "index.json") {
    id
    data {
      ...ConfigParts
    }
  }
}
    ${ConfigPartsFragmentDoc}`;
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
  body
}
    `;
export const AuthorPartsFragmentDoc = gql`
    fragment AuthorParts on Author {
  name
  title
  avatar
}
    `;
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
${AuthorPartsFragmentDoc}`;
export const PagePartsFragmentDoc = gql`
    fragment PageParts on Page {
  title
  body
}
    `;
export const PageDocumentQueryFragmentFragmentDoc = gql`
    fragment PageDocumentQueryFragment on PageDocument {
  __typename
  id
  data {
    ...PageParts
  }
}
    ${PagePartsFragmentDoc}`;
export const AuthorDocumentQueryFragmentFragmentDoc = gql`
    fragment AuthorDocumentQueryFragment on AuthorDocument {
  __typename
  id
  data {
    ...AuthorParts
  }
}
    ${AuthorPartsFragmentDoc}`;
export const GetResourcesDocument = gql`
    query getResources {
  ...ConfigQueryFragment
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
          ... on ConfigDocument {
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
    ${ConfigQueryFragmentFragmentDoc}`;
export const GetPostDocument = gql`
    query getPost($relativePath: String!) {
  ...ConfigQueryFragment
  getPostDocument(relativePath: $relativePath) {
    ...PostDocumentQueryFragment
  }
}
    ${ConfigQueryFragmentFragmentDoc}
${PostDocumentQueryFragmentFragmentDoc}`;
export const GetPageDocument = gql`
    query getPage($relativePath: String!) {
  ...ConfigQueryFragment
  getPageDocument(relativePath: $relativePath) {
    ...PageDocumentQueryFragment
  }
}
    ${ConfigQueryFragmentFragmentDoc}
${PageDocumentQueryFragmentFragmentDoc}`;
export const GetAuthorDocument = gql`
    query getAuthor($relativePath: String!) {
  ...ConfigQueryFragment
  getAuthorDocument(relativePath: $relativePath) {
    ...AuthorDocumentQueryFragment
  }
}
    ${ConfigQueryFragmentFragmentDoc}
${AuthorDocumentQueryFragmentFragmentDoc}`;
export const GetConfigDocumentDocument = gql`
    query getConfigDocument($relativePath: String!) {
  getConfigDocument(relativePath: $relativePath) {
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
      ...ConfigParts
    }
  }
}
    ${ConfigPartsFragmentDoc}`;
export const GetConfigListDocument = gql`
    query getConfigList {
  getConfigList {
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
          ...ConfigParts
        }
      }
    }
  }
}
    ${ConfigPartsFragmentDoc}`;
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
    ${PostPartsFragmentDoc}`;
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
    ${PostPartsFragmentDoc}`;
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
    ${AuthorPartsFragmentDoc}`;
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
    ${AuthorPartsFragmentDoc}`;
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
    ${PagePartsFragmentDoc}`;
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
    ${PagePartsFragmentDoc}`;
export type Requester<C= {}> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R>
  export function getSdk<C>(requester: Requester<C>) {
    return {
      getResources(variables?: GetResourcesQueryVariables, options?: C): Promise<{data: GetResourcesQuery, variables: GetResourcesQueryVariables, query: string}> {
        return requester<{data: GetResourcesQuery, variables: GetResourcesQueryVariables, query: string}, GetResourcesQueryVariables>(GetResourcesDocument, variables, options);
      },
    getPost(variables: GetPostQueryVariables, options?: C): Promise<{data: GetPostQuery, variables: GetPostQueryVariables, query: string}> {
        return requester<{data: GetPostQuery, variables: GetPostQueryVariables, query: string}, GetPostQueryVariables>(GetPostDocument, variables, options);
      },
    getPage(variables: GetPageQueryVariables, options?: C): Promise<{data: GetPageQuery, variables: GetPageQueryVariables, query: string}> {
        return requester<{data: GetPageQuery, variables: GetPageQueryVariables, query: string}, GetPageQueryVariables>(GetPageDocument, variables, options);
      },
    getAuthor(variables: GetAuthorQueryVariables, options?: C): Promise<{data: GetAuthorQuery, variables: GetAuthorQueryVariables, query: string}> {
        return requester<{data: GetAuthorQuery, variables: GetAuthorQueryVariables, query: string}, GetAuthorQueryVariables>(GetAuthorDocument, variables, options);
      },
    getConfigDocument(variables: GetConfigDocumentQueryVariables, options?: C): Promise<{data: GetConfigDocumentQuery, variables: GetConfigDocumentQueryVariables, query: string}> {
        return requester<{data: GetConfigDocumentQuery, variables: GetConfigDocumentQueryVariables, query: string}, GetConfigDocumentQueryVariables>(GetConfigDocumentDocument, variables, options);
      },
    getConfigList(variables?: GetConfigListQueryVariables, options?: C): Promise<{data: GetConfigListQuery, variables: GetConfigListQueryVariables, query: string}> {
        return requester<{data: GetConfigListQuery, variables: GetConfigListQueryVariables, query: string}, GetConfigListQueryVariables>(GetConfigListDocument, variables, options);
      },
    getPostDocument(variables: GetPostDocumentQueryVariables, options?: C): Promise<{data: GetPostDocumentQuery, variables: GetPostDocumentQueryVariables, query: string}> {
        return requester<{data: GetPostDocumentQuery, variables: GetPostDocumentQueryVariables, query: string}, GetPostDocumentQueryVariables>(GetPostDocumentDocument, variables, options);
      },
    getPostList(variables?: GetPostListQueryVariables, options?: C): Promise<{data: GetPostListQuery, variables: GetPostListQueryVariables, query: string}> {
        return requester<{data: GetPostListQuery, variables: GetPostListQueryVariables, query: string}, GetPostListQueryVariables>(GetPostListDocument, variables, options);
      },
    getAuthorDocument(variables: GetAuthorDocumentQueryVariables, options?: C): Promise<{data: GetAuthorDocumentQuery, variables: GetAuthorDocumentQueryVariables, query: string}> {
        return requester<{data: GetAuthorDocumentQuery, variables: GetAuthorDocumentQueryVariables, query: string}, GetAuthorDocumentQueryVariables>(GetAuthorDocumentDocument, variables, options);
      },
    getAuthorList(variables?: GetAuthorListQueryVariables, options?: C): Promise<{data: GetAuthorListQuery, variables: GetAuthorListQueryVariables, query: string}> {
        return requester<{data: GetAuthorListQuery, variables: GetAuthorListQueryVariables, query: string}, GetAuthorListQueryVariables>(GetAuthorListDocument, variables, options);
      },
    getPageDocument(variables: GetPageDocumentQueryVariables, options?: C): Promise<{data: GetPageDocumentQuery, variables: GetPageDocumentQueryVariables, query: string}> {
        return requester<{data: GetPageDocumentQuery, variables: GetPageDocumentQueryVariables, query: string}, GetPageDocumentQueryVariables>(GetPageDocumentDocument, variables, options);
      },
    getPageList(variables?: GetPageListQueryVariables, options?: C): Promise<{data: GetPageListQuery, variables: GetPageListQueryVariables, query: string}> {
        return requester<{data: GetPageListQuery, variables: GetPageListQueryVariables, query: string}, GetPageListQueryVariables>(GetPageListDocument, variables, options);
      }
    };
  }
  export type Sdk = ReturnType<typeof getSdk>;

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
export const ExperimentalGetTinaClient = ()=>getSdk(requester)

