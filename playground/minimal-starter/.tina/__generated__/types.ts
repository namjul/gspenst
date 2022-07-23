//@ts-nocheck
// DO NOT MODIFY THIS FILE. This file is automatically generated by Tina
export function gql(strings: TemplateStringsArray, ...args: string[]): string {
  let str = ''
  strings.forEach((string, i) => {
    str += string + (args[i] || '')
  })
  return str
}
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
  title?: Maybe<Scalars['String']>;
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
  id: Scalars['ID'];
  _sys?: Maybe<SystemInfo>;
  _values: Scalars['JSON'];
};

/** A relay-compliant pagination connection */
export type Connection = {
  totalCount: Scalars['Float'];
  pageInfo: PageInfo;
};

export type Query = {
  __typename?: 'Query';
  getOptimizedQuery?: Maybe<Scalars['String']>;
  collection: Collection;
  collections: Array<Collection>;
  node: Node;
  document: DocumentNode;
  config: Config;
  configConnection: ConfigConnection;
  page: Page;
  pageConnection: PageConnection;
  post: Post;
  postConnection: PostConnection;
  author: Author;
  authorConnection: AuthorConnection;
  tag: Tag;
  tagConnection: TagConnection;
};


export type QueryGetOptimizedQueryArgs = {
  queryString: Scalars['String'];
};


export type QueryCollectionArgs = {
  collection?: InputMaybe<Scalars['String']>;
};


export type QueryNodeArgs = {
  id?: InputMaybe<Scalars['String']>;
};


export type QueryDocumentArgs = {
  collection?: InputMaybe<Scalars['String']>;
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryConfigArgs = {
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryConfigConnectionArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ConfigFilter>;
};


export type QueryPageArgs = {
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryPageConnectionArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<PageFilter>;
};


export type QueryPostArgs = {
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryPostConnectionArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<PostFilter>;
};


export type QueryAuthorArgs = {
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryAuthorConnectionArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AuthorFilter>;
};


export type QueryTagArgs = {
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryTagConnectionArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<TagFilter>;
};

export type DocumentFilter = {
  config?: InputMaybe<ConfigFilter>;
  page?: InputMaybe<PageFilter>;
  post?: InputMaybe<PostFilter>;
  author?: InputMaybe<AuthorFilter>;
  tag?: InputMaybe<TagFilter>;
};

export type DocumentConnectionEdges = {
  __typename?: 'DocumentConnectionEdges';
  cursor: Scalars['String'];
  node?: Maybe<DocumentNode>;
};

export type DocumentConnection = Connection & {
  __typename?: 'DocumentConnection';
  pageInfo: PageInfo;
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
  sort?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<DocumentFilter>;
};

export type DocumentNode = Config | Page | Post | Author | Tag;

export type Config = Node & Document & {
  __typename?: 'Config';
  darkMode?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  _sys: SystemInfo;
  _values: Scalars['JSON'];
};

export type BooleanFilter = {
  eq?: InputMaybe<Scalars['Boolean']>;
  exists?: InputMaybe<Scalars['Boolean']>;
};

export type ConfigFilter = {
  darkMode?: InputMaybe<BooleanFilter>;
};

export type ConfigConnectionEdges = {
  __typename?: 'ConfigConnectionEdges';
  cursor: Scalars['String'];
  node?: Maybe<Config>;
};

export type ConfigConnection = Connection & {
  __typename?: 'ConfigConnection';
  pageInfo: PageInfo;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<ConfigConnectionEdges>>>;
};

export type PageAuthorsAuthor = Author;

export type PageAuthors = {
  __typename?: 'PageAuthors';
  author?: Maybe<PageAuthorsAuthor>;
};

export type PageTagsTag = Tag;

export type PageTags = {
  __typename?: 'PageTags';
  tag?: Maybe<PageTagsTag>;
};

export type Page = Node & Document & {
  __typename?: 'Page';
  date?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  excerpt?: Maybe<Scalars['String']>;
  authors?: Maybe<Array<Maybe<PageAuthors>>>;
  tags?: Maybe<Array<Maybe<PageTags>>>;
  content?: Maybe<Scalars['JSON']>;
  id: Scalars['ID'];
  _sys: SystemInfo;
  _values: Scalars['JSON'];
};

export type DatetimeFilter = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  eq?: InputMaybe<Scalars['String']>;
  exists?: InputMaybe<Scalars['Boolean']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type StringFilter = {
  startsWith?: InputMaybe<Scalars['String']>;
  eq?: InputMaybe<Scalars['String']>;
  exists?: InputMaybe<Scalars['Boolean']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type PageAuthorsAuthorFilter = {
  author?: InputMaybe<AuthorFilter>;
};

export type PageAuthorsFilter = {
  author?: InputMaybe<PageAuthorsAuthorFilter>;
};

export type PageTagsTagFilter = {
  tag?: InputMaybe<TagFilter>;
};

export type PageTagsFilter = {
  tag?: InputMaybe<PageTagsTagFilter>;
};

export type PageContentUnstable_InternalLinkDocumentFilter = {
  post?: InputMaybe<PostFilter>;
};

export type PageContentUnstable_InternalLinkFilter = {
  text?: InputMaybe<StringFilter>;
  document?: InputMaybe<PageContentUnstable_InternalLinkDocumentFilter>;
};

export type PageContentFilter = {
  unstable_InternalLink?: InputMaybe<PageContentUnstable_InternalLinkFilter>;
};

export type PageFilter = {
  date?: InputMaybe<DatetimeFilter>;
  slug?: InputMaybe<StringFilter>;
  title?: InputMaybe<StringFilter>;
  excerpt?: InputMaybe<StringFilter>;
  authors?: InputMaybe<PageAuthorsFilter>;
  tags?: InputMaybe<PageTagsFilter>;
  content?: InputMaybe<PageContentFilter>;
};

export type PageConnectionEdges = {
  __typename?: 'PageConnectionEdges';
  cursor: Scalars['String'];
  node?: Maybe<Page>;
};

export type PageConnection = Connection & {
  __typename?: 'PageConnection';
  pageInfo: PageInfo;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<PageConnectionEdges>>>;
};

export type PostAuthorsAuthor = Author;

export type PostAuthors = {
  __typename?: 'PostAuthors';
  author?: Maybe<PostAuthorsAuthor>;
};

export type PostTagsTag = Tag;

export type PostTags = {
  __typename?: 'PostTags';
  tag?: Maybe<PostTagsTag>;
};

export type Post = Node & Document & {
  __typename?: 'Post';
  date?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  excerpt?: Maybe<Scalars['String']>;
  authors?: Maybe<Array<Maybe<PostAuthors>>>;
  tags?: Maybe<Array<Maybe<PostTags>>>;
  content?: Maybe<Scalars['JSON']>;
  id: Scalars['ID'];
  _sys: SystemInfo;
  _values: Scalars['JSON'];
};

export type PostAuthorsAuthorFilter = {
  author?: InputMaybe<AuthorFilter>;
};

export type PostAuthorsFilter = {
  author?: InputMaybe<PostAuthorsAuthorFilter>;
};

export type PostTagsTagFilter = {
  tag?: InputMaybe<TagFilter>;
};

export type PostTagsFilter = {
  tag?: InputMaybe<PostTagsTagFilter>;
};

export type PostContentUnstable_InternalLinkDocumentFilter = {
  post?: InputMaybe<PostFilter>;
};

export type PostContentUnstable_InternalLinkFilter = {
  text?: InputMaybe<StringFilter>;
  document?: InputMaybe<PostContentUnstable_InternalLinkDocumentFilter>;
};

export type PostContentFilter = {
  unstable_InternalLink?: InputMaybe<PostContentUnstable_InternalLinkFilter>;
};

export type PostFilter = {
  date?: InputMaybe<DatetimeFilter>;
  slug?: InputMaybe<StringFilter>;
  title?: InputMaybe<StringFilter>;
  excerpt?: InputMaybe<StringFilter>;
  authors?: InputMaybe<PostAuthorsFilter>;
  tags?: InputMaybe<PostTagsFilter>;
  content?: InputMaybe<PostContentFilter>;
};

export type PostConnectionEdges = {
  __typename?: 'PostConnectionEdges';
  cursor: Scalars['String'];
  node?: Maybe<Post>;
};

export type PostConnection = Connection & {
  __typename?: 'PostConnection';
  pageInfo: PageInfo;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<PostConnectionEdges>>>;
};

export type Author = Node & Document & {
  __typename?: 'Author';
  name?: Maybe<Scalars['String']>;
  date?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  _sys: SystemInfo;
  _values: Scalars['JSON'];
};

export type AuthorFilter = {
  name?: InputMaybe<StringFilter>;
  date?: InputMaybe<DatetimeFilter>;
  slug?: InputMaybe<StringFilter>;
};

export type AuthorConnectionEdges = {
  __typename?: 'AuthorConnectionEdges';
  cursor: Scalars['String'];
  node?: Maybe<Author>;
};

export type AuthorConnection = Connection & {
  __typename?: 'AuthorConnection';
  pageInfo: PageInfo;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<AuthorConnectionEdges>>>;
};

export type Tag = Node & Document & {
  __typename?: 'Tag';
  name?: Maybe<Scalars['String']>;
  date?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  _sys: SystemInfo;
  _values: Scalars['JSON'];
};

export type TagFilter = {
  name?: InputMaybe<StringFilter>;
  date?: InputMaybe<DatetimeFilter>;
  slug?: InputMaybe<StringFilter>;
};

export type TagConnectionEdges = {
  __typename?: 'TagConnectionEdges';
  cursor: Scalars['String'];
  node?: Maybe<Tag>;
};

export type TagConnection = Connection & {
  __typename?: 'TagConnection';
  pageInfo: PageInfo;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<TagConnectionEdges>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addPendingDocument: DocumentNode;
  updateDocument: DocumentNode;
  deleteDocument: DocumentNode;
  createDocument: DocumentNode;
  updateConfig: Config;
  createConfig: Config;
  updatePage: Page;
  createPage: Page;
  updatePost: Post;
  createPost: Post;
  updateAuthor: Author;
  createAuthor: Author;
  updateTag: Tag;
  createTag: Tag;
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


export type MutationDeleteDocumentArgs = {
  collection?: InputMaybe<Scalars['String']>;
  relativePath: Scalars['String'];
};


export type MutationCreateDocumentArgs = {
  collection?: InputMaybe<Scalars['String']>;
  relativePath: Scalars['String'];
  params: DocumentMutation;
};


export type MutationUpdateConfigArgs = {
  relativePath: Scalars['String'];
  params: ConfigMutation;
};


export type MutationCreateConfigArgs = {
  relativePath: Scalars['String'];
  params: ConfigMutation;
};


export type MutationUpdatePageArgs = {
  relativePath: Scalars['String'];
  params: PageMutation;
};


export type MutationCreatePageArgs = {
  relativePath: Scalars['String'];
  params: PageMutation;
};


export type MutationUpdatePostArgs = {
  relativePath: Scalars['String'];
  params: PostMutation;
};


export type MutationCreatePostArgs = {
  relativePath: Scalars['String'];
  params: PostMutation;
};


export type MutationUpdateAuthorArgs = {
  relativePath: Scalars['String'];
  params: AuthorMutation;
};


export type MutationCreateAuthorArgs = {
  relativePath: Scalars['String'];
  params: AuthorMutation;
};


export type MutationUpdateTagArgs = {
  relativePath: Scalars['String'];
  params: TagMutation;
};


export type MutationCreateTagArgs = {
  relativePath: Scalars['String'];
  params: TagMutation;
};

export type DocumentMutation = {
  config?: InputMaybe<ConfigMutation>;
  page?: InputMaybe<PageMutation>;
  post?: InputMaybe<PostMutation>;
  author?: InputMaybe<AuthorMutation>;
  tag?: InputMaybe<TagMutation>;
};

export type ConfigMutation = {
  darkMode?: InputMaybe<Scalars['Boolean']>;
};

export type PageAuthorsMutation = {
  author?: InputMaybe<Scalars['String']>;
};

export type PageTagsMutation = {
  tag?: InputMaybe<Scalars['String']>;
};

export type PageMutation = {
  date?: InputMaybe<Scalars['String']>;
  slug?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  excerpt?: InputMaybe<Scalars['String']>;
  authors?: InputMaybe<Array<InputMaybe<PageAuthorsMutation>>>;
  tags?: InputMaybe<Array<InputMaybe<PageTagsMutation>>>;
  content?: InputMaybe<Scalars['JSON']>;
};

export type PostAuthorsMutation = {
  author?: InputMaybe<Scalars['String']>;
};

export type PostTagsMutation = {
  tag?: InputMaybe<Scalars['String']>;
};

export type PostMutation = {
  date?: InputMaybe<Scalars['String']>;
  slug?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  excerpt?: InputMaybe<Scalars['String']>;
  authors?: InputMaybe<Array<InputMaybe<PostAuthorsMutation>>>;
  tags?: InputMaybe<Array<InputMaybe<PostTagsMutation>>>;
  content?: InputMaybe<Scalars['JSON']>;
};

export type AuthorMutation = {
  name?: InputMaybe<Scalars['String']>;
  date?: InputMaybe<Scalars['String']>;
  slug?: InputMaybe<Scalars['String']>;
};

export type TagMutation = {
  name?: InputMaybe<Scalars['String']>;
  date?: InputMaybe<Scalars['String']>;
  slug?: InputMaybe<Scalars['String']>;
};

export type ConfigPartsFragment = { __typename?: 'Config', darkMode?: boolean | null };

export type PagePartsFragment = { __typename?: 'Page', date?: string | null, slug?: string | null, title?: string | null, excerpt?: string | null, content?: any | null, authors?: Array<{ __typename: 'PageAuthors', author?: { __typename?: 'Author', id: string } | null } | null> | null, tags?: Array<{ __typename: 'PageTags', tag?: { __typename?: 'Tag', id: string } | null } | null> | null };

export type PostPartsFragment = { __typename?: 'Post', date?: string | null, slug?: string | null, title?: string | null, excerpt?: string | null, content?: any | null, authors?: Array<{ __typename: 'PostAuthors', author?: { __typename?: 'Author', id: string } | null } | null> | null, tags?: Array<{ __typename: 'PostTags', tag?: { __typename?: 'Tag', id: string } | null } | null> | null };

export type AuthorPartsFragment = { __typename?: 'Author', name?: string | null, date?: string | null, slug?: string | null };

export type TagPartsFragment = { __typename?: 'Tag', name?: string | null, date?: string | null, slug?: string | null };

export type ConfigQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type ConfigQuery = { __typename?: 'Query', config: { __typename?: 'Config', id: string, darkMode?: boolean | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string } } };

export type ConfigConnectionQueryVariables = Exact<{
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ConfigFilter>;
}>;


export type ConfigConnectionQuery = { __typename?: 'Query', configConnection: { __typename?: 'ConfigConnection', totalCount: number, edges?: Array<{ __typename?: 'ConfigConnectionEdges', node?: { __typename?: 'Config', id: string, darkMode?: boolean | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string } } | null } | null> | null } };

export type PageQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type PageQuery = { __typename?: 'Query', page: { __typename?: 'Page', id: string, date?: string | null, slug?: string | null, title?: string | null, excerpt?: string | null, content?: any | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, authors?: Array<{ __typename: 'PageAuthors', author?: { __typename?: 'Author', id: string } | null } | null> | null, tags?: Array<{ __typename: 'PageTags', tag?: { __typename?: 'Tag', id: string } | null } | null> | null } };

export type PageConnectionQueryVariables = Exact<{
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<PageFilter>;
}>;


export type PageConnectionQuery = { __typename?: 'Query', pageConnection: { __typename?: 'PageConnection', totalCount: number, edges?: Array<{ __typename?: 'PageConnectionEdges', node?: { __typename?: 'Page', id: string, date?: string | null, slug?: string | null, title?: string | null, excerpt?: string | null, content?: any | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, authors?: Array<{ __typename: 'PageAuthors', author?: { __typename?: 'Author', id: string } | null } | null> | null, tags?: Array<{ __typename: 'PageTags', tag?: { __typename?: 'Tag', id: string } | null } | null> | null } | null } | null> | null } };

export type PostQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type PostQuery = { __typename?: 'Query', post: { __typename?: 'Post', id: string, date?: string | null, slug?: string | null, title?: string | null, excerpt?: string | null, content?: any | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, authors?: Array<{ __typename: 'PostAuthors', author?: { __typename?: 'Author', id: string } | null } | null> | null, tags?: Array<{ __typename: 'PostTags', tag?: { __typename?: 'Tag', id: string } | null } | null> | null } };

export type PostConnectionQueryVariables = Exact<{
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<PostFilter>;
}>;


export type PostConnectionQuery = { __typename?: 'Query', postConnection: { __typename?: 'PostConnection', totalCount: number, edges?: Array<{ __typename?: 'PostConnectionEdges', node?: { __typename?: 'Post', id: string, date?: string | null, slug?: string | null, title?: string | null, excerpt?: string | null, content?: any | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, authors?: Array<{ __typename: 'PostAuthors', author?: { __typename?: 'Author', id: string } | null } | null> | null, tags?: Array<{ __typename: 'PostTags', tag?: { __typename?: 'Tag', id: string } | null } | null> | null } | null } | null> | null } };

export type AuthorQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type AuthorQuery = { __typename?: 'Query', author: { __typename?: 'Author', id: string, name?: string | null, date?: string | null, slug?: string | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string } } };

export type AuthorConnectionQueryVariables = Exact<{
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AuthorFilter>;
}>;


export type AuthorConnectionQuery = { __typename?: 'Query', authorConnection: { __typename?: 'AuthorConnection', totalCount: number, edges?: Array<{ __typename?: 'AuthorConnectionEdges', node?: { __typename?: 'Author', id: string, name?: string | null, date?: string | null, slug?: string | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string } } | null } | null> | null } };

export type TagQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type TagQuery = { __typename?: 'Query', tag: { __typename?: 'Tag', id: string, name?: string | null, date?: string | null, slug?: string | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string } } };

export type TagConnectionQueryVariables = Exact<{
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<TagFilter>;
}>;


export type TagConnectionQuery = { __typename?: 'Query', tagConnection: { __typename?: 'TagConnection', totalCount: number, edges?: Array<{ __typename?: 'TagConnectionEdges', node?: { __typename?: 'Tag', id: string, name?: string | null, date?: string | null, slug?: string | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string } } | null } | null> | null } };

export const ConfigPartsFragmentDoc = gql`
    fragment ConfigParts on Config {
  darkMode
}
    `;
export const PagePartsFragmentDoc = gql`
    fragment PageParts on Page {
  date
  slug
  title
  excerpt
  authors {
    __typename
    author {
      ... on Document {
        id
      }
    }
  }
  tags {
    __typename
    tag {
      ... on Document {
        id
      }
    }
  }
  content
}
    `;
export const PostPartsFragmentDoc = gql`
    fragment PostParts on Post {
  date
  slug
  title
  excerpt
  authors {
    __typename
    author {
      ... on Document {
        id
      }
    }
  }
  tags {
    __typename
    tag {
      ... on Document {
        id
      }
    }
  }
  content
}
    `;
export const AuthorPartsFragmentDoc = gql`
    fragment AuthorParts on Author {
  name
  date
  slug
}
    `;
export const TagPartsFragmentDoc = gql`
    fragment TagParts on Tag {
  name
  date
  slug
}
    `;
export const ConfigDocument = gql`
    query config($relativePath: String!) {
  config(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...ConfigParts
  }
}
    ${ConfigPartsFragmentDoc}`;
export const ConfigConnectionDocument = gql`
    query configConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: ConfigFilter) {
  configConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    totalCount
    edges {
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...ConfigParts
      }
    }
  }
}
    ${ConfigPartsFragmentDoc}`;
export const PageDocument = gql`
    query page($relativePath: String!) {
  page(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PageParts
  }
}
    ${PagePartsFragmentDoc}`;
export const PageConnectionDocument = gql`
    query pageConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PageFilter) {
  pageConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    totalCount
    edges {
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PageParts
      }
    }
  }
}
    ${PagePartsFragmentDoc}`;
export const PostDocument = gql`
    query post($relativePath: String!) {
  post(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PostParts
  }
}
    ${PostPartsFragmentDoc}`;
export const PostConnectionDocument = gql`
    query postConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PostFilter) {
  postConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    totalCount
    edges {
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PostParts
      }
    }
  }
}
    ${PostPartsFragmentDoc}`;
export const AuthorDocument = gql`
    query author($relativePath: String!) {
  author(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...AuthorParts
  }
}
    ${AuthorPartsFragmentDoc}`;
export const AuthorConnectionDocument = gql`
    query authorConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: AuthorFilter) {
  authorConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    totalCount
    edges {
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...AuthorParts
      }
    }
  }
}
    ${AuthorPartsFragmentDoc}`;
export const TagDocument = gql`
    query tag($relativePath: String!) {
  tag(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...TagParts
  }
}
    ${TagPartsFragmentDoc}`;
export const TagConnectionDocument = gql`
    query tagConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: TagFilter) {
  tagConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    totalCount
    edges {
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...TagParts
      }
    }
  }
}
    ${TagPartsFragmentDoc}`;
export type Requester<C= {}> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R>
  export function getSdk<C>(requester: Requester<C>) {
    return {
      config(variables: ConfigQueryVariables, options?: C): Promise<{data: ConfigQuery, variables: ConfigQueryVariables, query: string}> {
        return requester<{data: ConfigQuery, variables: ConfigQueryVariables, query: string}, ConfigQueryVariables>(ConfigDocument, variables, options);
      },
    configConnection(variables?: ConfigConnectionQueryVariables, options?: C): Promise<{data: ConfigConnectionQuery, variables: ConfigConnectionQueryVariables, query: string}> {
        return requester<{data: ConfigConnectionQuery, variables: ConfigConnectionQueryVariables, query: string}, ConfigConnectionQueryVariables>(ConfigConnectionDocument, variables, options);
      },
    page(variables: PageQueryVariables, options?: C): Promise<{data: PageQuery, variables: PageQueryVariables, query: string}> {
        return requester<{data: PageQuery, variables: PageQueryVariables, query: string}, PageQueryVariables>(PageDocument, variables, options);
      },
    pageConnection(variables?: PageConnectionQueryVariables, options?: C): Promise<{data: PageConnectionQuery, variables: PageConnectionQueryVariables, query: string}> {
        return requester<{data: PageConnectionQuery, variables: PageConnectionQueryVariables, query: string}, PageConnectionQueryVariables>(PageConnectionDocument, variables, options);
      },
    post(variables: PostQueryVariables, options?: C): Promise<{data: PostQuery, variables: PostQueryVariables, query: string}> {
        return requester<{data: PostQuery, variables: PostQueryVariables, query: string}, PostQueryVariables>(PostDocument, variables, options);
      },
    postConnection(variables?: PostConnectionQueryVariables, options?: C): Promise<{data: PostConnectionQuery, variables: PostConnectionQueryVariables, query: string}> {
        return requester<{data: PostConnectionQuery, variables: PostConnectionQueryVariables, query: string}, PostConnectionQueryVariables>(PostConnectionDocument, variables, options);
      },
    author(variables: AuthorQueryVariables, options?: C): Promise<{data: AuthorQuery, variables: AuthorQueryVariables, query: string}> {
        return requester<{data: AuthorQuery, variables: AuthorQueryVariables, query: string}, AuthorQueryVariables>(AuthorDocument, variables, options);
      },
    authorConnection(variables?: AuthorConnectionQueryVariables, options?: C): Promise<{data: AuthorConnectionQuery, variables: AuthorConnectionQueryVariables, query: string}> {
        return requester<{data: AuthorConnectionQuery, variables: AuthorConnectionQueryVariables, query: string}, AuthorConnectionQueryVariables>(AuthorConnectionDocument, variables, options);
      },
    tag(variables: TagQueryVariables, options?: C): Promise<{data: TagQuery, variables: TagQueryVariables, query: string}> {
        return requester<{data: TagQuery, variables: TagQueryVariables, query: string}, TagQueryVariables>(TagDocument, variables, options);
      },
    tagConnection(variables?: TagConnectionQueryVariables, options?: C): Promise<{data: TagConnectionQuery, variables: TagConnectionQueryVariables, query: string}> {
        return requester<{data: TagConnectionQuery, variables: TagConnectionQueryVariables, query: string}, TagConnectionQueryVariables>(TagConnectionDocument, variables, options);
      }
    };
  }
  export type Sdk = ReturnType<typeof getSdk>;

// TinaSDK generated code
import { createClient, TinaClient } from "tinacms/dist/client";

const generateRequester = (client: TinaClient) => {
  const requester: (
    doc: any,
    vars?: any,
    options?: any,
    client
  ) => Promise<any> = async (doc, vars, _options) => {
    let data = {};
    try {
      data = await client.request({
        query: doc,
        variables: vars,
      });
    } catch (e) {
      // swallow errors related to document creation
      console.warn("Warning: There was an error when fetching data");
      console.warn(e);
    }

    return { data: data?.data, query: doc, variables: vars || {} };
  };

  return requester;
};

/**
 * @experimental this class can be used but may change in the future
 **/
export const ExperimentalGetTinaClient = () =>
  getSdk(
    generateRequester(createClient({ url: "http://localhost:4001/graphql" }))
  );

export const queries = (client: TinaClient) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};

