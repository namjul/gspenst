import type { ResultAsync } from '../shared-kernel'
import { okAsync } from '../shared-kernel'
import type {
  GetPostQuery,
  GetPageQuery,
  GetAuthorQuery,
  GetTagQuery,
  GetConfigQuery,
} from '../../.tina/__generated__/types'
import type { GetTags, GetAuthors, GetPosts, GetPages } from '../api'

type ApiResultAsync<T> = ResultAsync<T>

const authors: { [name: string]: GetAuthorQuery } = {
  'napoleon.mdx': {
    author: {
      __typename: 'Author' as const,
      _sys: {
        filename: 'napoleon',
        basename: 'napoleon.mdx',
        breadcrumbs: ['napoleon'],
        path: `content/authors/napoleon.mdx`,
        relativePath: 'napoleon.mdx',
        extension: '.mdx',
      },
      id: `content/authors/napoleon.mdx`,
      name: 'Napoleon',
      date: '2021-07-03T20:30:00.000Z',
      slug: 'napoleon',
    },
  },
  'pedro.mdx': {
    author: {
      __typename: 'Author' as const,
      _sys: {
        filename: 'pedro',
        basename: 'pedro.mdx',
        breadcrumbs: ['pedro'],
        path: `content/authors/pedro.mdx`,
        relativePath: 'pedro.mdx',
        extension: '.mdx',
      },
      id: `content/authors/pedro.mdx`,
      name: 'Pedro',
      date: '2021-07-03T20:30:00.000Z',
      slug: 'pedro',
    },
  },
}

const tags: { [name: string]: GetTagQuery } = {
  'tag-1.mdx': {
    tag: {
      __typename: 'Tag' as const,
      _sys: {
        filename: 'tag-1',
        basename: 'tag-1.mdx',
        breadcrumbs: ['tag-1'],
        path: `content/tags/tag-1.mdx`,
        relativePath: 'tag-1.mdx',
        extension: '.mdx',
      },
      id: `content/tags/tag-1.mdx`,
      name: 'Tag -1',
      date: '2021-07-03T20:30:00.000Z',
      slug: 'tag-1',
    },
  },
  'tag-2.mdx': {
    tag: {
      __typename: 'Tag' as const,
      _sys: {
        filename: 'tag-2',
        basename: 'tag-2.mdx',
        breadcrumbs: ['tag-2'],
        path: `content/tags/tag-2.mdx`,
        relativePath: 'tag-2.mdx',
        extension: '.mdx',
      },
      id: `content/tags/tag-2.mdx`,
      name: 'Tag-2',
      date: '2021-07-03T20:30:00.000Z',
      slug: 'tag-2',
    },
  },
}

const posts: { [name: string]: GetPostQuery } = {
  '0th-post.mdx': {
    post: {
      __typename: 'Post' as const,
      _sys: {
        filename: '0th-post',
        basename: '0th-post.mdx',
        breadcrumbs: ['0th-post'],
        path: `content/posts/0th-post.mdx`,
        relativePath: '0th-post.mdx',
        extension: '.mdx',
      },
      id: `content/posts/0th-post.mdx`,
      title: '0th Post',
      excerpt: {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus.',
              },
            ],
          },
        ],
      },
      slug: '0th-post',
      date: '2021-07-03T20:30:00.000Z',
      content: {
        type: 'root',
        children: [],
      },
    },
  },
  '1th-post.mdx': {
    post: {
      __typename: 'Post' as const,
      _sys: {
        filename: '1th-post',
        basename: '1th-post.mdx',
        breadcrumbs: ['1th-post'],
        path: `content/posts/1th-post.mdx`,
        relativePath: '1th-post.mdx',
        extension: '.mdx',
      },
      id: `content/posts/1th-post.mdx`,
      title: '1th Post',
      excerpt: {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus.',
              },
            ],
          },
        ],
      },
      slug: '1th-post',
      date: '2021-01-03T20:30:00.000Z',
      content: {
        type: 'root',
        children: [],
      },
    },
  },
  '2th-post.mdx': {
    post: {
      __typename: 'Post' as const,
      _sys: {
        filename: '2th-post',
        basename: '2th-post.mdx',
        breadcrumbs: ['2th-post'],
        path: `content/posts/2th-post.mdx`,
        relativePath: '2th-post.mdx',
        extension: '.mdx',
      },
      id: `content/posts/2th-post.mdx`,
      title: '2th Post',
      excerpt: {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus.',
              },
            ],
          },
        ],
      },
      slug: '2th-post',
      date: '2021-02-03T20:30:00.000Z',
      content: {
        type: 'root',
        children: [],
      },
    },
  },
  '3th-post.mdx': {
    post: {
      __typename: 'Post' as const,
      _sys: {
        filename: '3th-post',
        basename: '3th-post.mdx',
        breadcrumbs: ['3th-post'],
        path: `content/posts/3th-post.mdx`,
        relativePath: '3th-post.mdx',
        extension: '.mdx',
      },
      id: `content/posts/3th-post.mdx`,
      title: '3th Post',
      excerpt: {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus.',
              },
            ],
          },
        ],
      },
      slug: '3th-post',
      date: '2021-03-03T20:30:00.000Z',
      content: {
        type: 'root',
        children: [],
      },
      tags: [
        {
          ...tags['tag-1.mdx'],
          __typename: 'PostTags' as const,
        },
      ],
      authors: [
        {
          ...authors['pedro.mdx'],
          __typename: 'PostAuthors' as const,
        },
      ],
    },
  },
  '4th-post.mdx': {
    post: {
      __typename: 'Post' as const,
      _sys: {
        filename: '4th-post',
        basename: '4th-post.mdx',
        breadcrumbs: ['4th-post'],
        path: `content/posts/4th-post.mdx`,
        relativePath: '4th-post.mdx',
        extension: '.mdx',
      },
      id: `content/posts/4th-post.mdx`,
      title: '4th Post',
      excerpt: {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus.',
              },
            ],
          },
        ],
      },
      slug: '4th-post',
      date: '2021-07-03T20:30:00.000Z',
      content: {
        type: 'root',
        children: [],
      },
      tags: [
        {
          ...tags['tag-2.mdx'],
          __typename: 'PostTags' as const,
        },
      ],
      authors: [
        {
          ...authors['napoleon.mdx'],
          __typename: 'PostAuthors' as const,
        },
      ],
    },
  },
  '5th-post.mdx': {
    post: {
      __typename: 'Post' as const,
      _sys: {
        filename: '5th-post',
        basename: '5th-post.mdx',
        breadcrumbs: ['5th-post'],
        path: `content/posts/5th-post.mdx`,
        relativePath: '5th-post.mdx',
        extension: '.mdx',
      },
      id: `content/posts/5th-post.mdx`,
      title: '5th Post',
      excerpt: {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus.',
              },
            ],
          },
        ],
      },
      slug: '5th-post',
      date: '2021-07-03T20:30:00.000Z',
      content: {
        type: 'root',
        children: [],
      },
    },
  },
  '6th-post.mdx': {
    post: {
      __typename: 'Post' as const,
      _sys: {
        filename: '6th-post',
        basename: '6th-post.mdx',
        breadcrumbs: ['6th-post'],
        path: `content/posts/6th-post.mdx`,
        relativePath: '6th-post.mdx',
        extension: '.mdx',
      },
      id: `content/posts/6th-post.mdx`,
      title: '6th Post',
      excerpt: {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus.',
              },
            ],
          },
        ],
      },
      slug: '6th-post',
      date: '2021-07-03T20:30:00.000Z',
      content: {
        type: 'root',
        children: [],
      },
    },
  },
  '7th-post.mdx': {
    post: {
      __typename: 'Post' as const,
      _sys: {
        filename: '7th-post',
        basename: '7th-post.mdx',
        breadcrumbs: ['7th-post'],
        path: `content/posts/7th-post.mdx`,
        relativePath: '7th-post.mdx',
        extension: '.mdx',
      },
      id: `content/posts/7th-post.mdx`,
      tags: [
        {
          ...tags['tag-2.mdx'],
          ...tags['tag-1.mdx'],
          __typename: 'PostTags' as const,
        },
      ],
      authors: [
        {
          ...authors['napoleon.mdx'],
          ...authors['pedro.mdx'],
          __typename: 'PostAuthors' as const,
        },
      ],
      title: '7th Post',
      excerpt: {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus.',
              },
            ],
          },
        ],
      },
      slug: '7th-post',
      date: '2021-07-03T20:30:00.000Z',
      content: {
        type: 'root',
        children: [],
      },
    },
  },
  '8th-post.mdx': {
    post: {
      __typename: 'Post' as const,
      _sys: {
        filename: '8th-post',
        basename: '8th-post.mdx',
        breadcrumbs: ['8th-post'],
        path: `content/posts/8th-post.mdx`,
        relativePath: '8th-post.mdx',
        extension: '.mdx',
      },
      id: `content/posts/8th-post.mdx`,
      title: '8th Post',
      excerpt: {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus.',
              },
            ],
          },
        ],
      },
      slug: '8th-post',
      date: '2021-07-03T20:30:00.000Z',
      content: {
        type: 'root',
        children: [],
      },
    },
  },
  '9th-post.mdx': {
    post: {
      __typename: 'Post' as const,
      _sys: {
        filename: '9th-post',
        basename: '9th-post.mdx',
        breadcrumbs: ['9th-post'],
        path: `content/posts/9th-post.mdx`,
        relativePath: '9th-post.mdx',
        extension: '.mdx',
      },
      id: `content/posts/9th-post.mdx`,
      title: '9th Post',
      excerpt: {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus.',
              },
            ],
          },
        ],
      },
      slug: '9th-post',
      date: '2021-07-03T20:30:00.000Z',
      content: {
        type: 'root',
        children: [],
      },
    },
  },
}

const pages: { [name: string]: GetPageQuery } = {
  'about.mdx': {
    page: {
      __typename: 'Page',
      id: 'content/pages/about.mdx',
      _sys: {
        filename: 'about',
        basename: 'about.mdx',
        breadcrumbs: ['about'],
        path: 'content/pages/about.mdx',
        relativePath: 'about.mdx',
        extension: '.mdx',
      },
      title: 'about',
      slug: 'about',
      date: '2021-07-03T20:30:00.000Z',
      tags: null,
      authors: null,
      content: {
        type: 'root',
        children: [],
      },
    },
  },
  'home.mdx': {
    page: {
      __typename: 'Page' as const,
      _sys: {
        filename: 'home',
        basename: 'home.mdx',
        breadcrumbs: ['home'],
        path: `content/pages/home.mdx`,
        relativePath: 'home.mdx',
        extension: '.mdx',
      },
      id: `content/pages/home.mdx`,
      title: 'Home',
      excerpt: {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus.',
              },
            ],
          },
        ],
      },
      slug: 'home',
      date: '2021-07-03T20:30:00.000Z',
      content: {
        type: 'root',
        children: [],
      },
    },
  },
  'portfolio.mdx': {
    page: {
      __typename: 'Page',
      id: 'content/pages/portfolio.mdx',
      _sys: {
        filename: 'portfolio',
        basename: 'portfolio.mdx',
        breadcrumbs: ['portfolio'],
        path: 'content/pages/portfolio.mdx',
        relativePath: 'portfolio.mdx',
        extension: '.mdx',
      },
      slug: 'portfolio',
      title: 'Portfolio',
      date: '2021-07-03T20:30:00.000Z',
      tags: null,
      authors: null,
      content: {
        type: 'root',
        children: [],
      },
    },
  },
}

export const getPost = ({
  relativePath,
}: {
  relativePath: string
}): ApiResultAsync<{ data: GetPostQuery }> => {
  return okAsync({ data: posts[relativePath]! })
}

export const getPosts = (): ApiResultAsync<GetPosts> => {
  return okAsync({
    data: {
      postConnection: {
        totalCount: Object.values(posts).length,
        edges: Object.values(posts).map(({ post }) => ({ node: post })),
      },
    },
    variables: {},
    query: '',
  })
}

export const getPage = ({
  relativePath,
}: {
  relativePath: string
}): ApiResultAsync<{ data: GetPageQuery }> => {
  return okAsync({ data: pages[relativePath]! })
}

export const getPages = (): ApiResultAsync<GetPages> => {
  return okAsync({
    data: {
      pageConnection: {
        totalCount: Object.values(pages).length,
        edges: Object.values(pages).map(({ page }) => ({ node: page })),
      },
    },
    variables: {},
    query: '',
  })
}

export const getAuthor = ({
  relativePath,
}: {
  relativePath: keyof typeof authors
}): ApiResultAsync<{ data: GetAuthorQuery }> => {
  return okAsync({ data: authors[relativePath]! })
}

export const getAuthors = (): ApiResultAsync<GetAuthors> => {
  return okAsync({
    data: {
      authorConnection: {
        totalCount: Object.values(authors).length,
        edges: Object.values(authors).map(({ author }) => ({
          node: author,
        })),
      },
    },
    variables: {},
    query: '',
  })
}

export const getTag = ({
  relativePath,
}: {
  relativePath: keyof typeof tags
}): ApiResultAsync<{ data: GetTagQuery }> => {
  return okAsync({ data: tags[relativePath]! })
}

export const getTags = (): ApiResultAsync<GetTags> => {
  return okAsync({
    data: {
      tagConnection: {
        totalCount: Object.values(tags).length,
        edges: Object.values(tags).map(({ tag }) => ({ node: tag })),
      },
    },
    variables: {},
    query: '',
  })
}

export const getConfig = (): ApiResultAsync<{ data: GetConfigQuery }> => {
  return okAsync({
    data: {
      config: {
        __typename: 'Config',
        _sys: {
          filename: 'index',
          basename: 'index.json',
          breadcrumbs: ['index'],
          path: 'content/config/index.json',
          relativePath: 'index.json',
          extension: '.json',
        },
        id: 'content/config/index.json',
        _values: { _collection: 'config', _template: 'config', darkMode: true },
      },
    },
  })
}
