import type { ResultAsync } from '../shared-kernel'
import { okAsync } from '../shared-kernel'
import type {
  GetResourcesQuery,
  GetPostQuery,
  GetPageQuery,
  GetAuthorQuery,
  GetTagQuery,
  GetConfigQuery,
} from '../../.tina/__generated__/types'

type ApiResultAsync<T> = ResultAsync<T>

export const getResources = (): ApiResultAsync<{
  data: GetResourcesQuery
}> => {
  return okAsync({
    data: {
      __typename: 'Query',
      collections: [
        {
          __typename: 'Collection',
          name: 'config',
          slug: 'config',
          path: 'content/config',
          matches: null,
          documents: {
            totalCount: 1,
            edges: [
              {
                node: {
                  __typename: 'Config',
                  id: 'content/config/index.json',
                  _sys: {
                    filename: 'index',
                    basename: 'index.json',
                    breadcrumbs: ['index'],
                    path: 'content/config/index.json',
                    relativePath: 'index.json',
                    extension: '.json',
                  },
                },
              },
            ],
          },
        },
        {
          __typename: 'Collection',
          name: 'page',
          slug: 'page',
          path: 'content/pages',
          matches: null,
          documents: {
            totalCount: 3,
            edges: [
              {
                node: {
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
                  slug: 'about',
                  date: '2021-07-03T20:30:00.000Z',
                  tags: null,
                  authors: null,
                },
              },
              {
                node: {
                  __typename: 'Page',
                  id: 'content/pages/home.mdx',
                  _sys: {
                    filename: 'home',
                    basename: 'home.mdx',
                    breadcrumbs: ['home'],
                    path: 'content/pages/home.mdx',
                    relativePath: 'home.mdx',
                    extension: '.mdx',
                  },
                  slug: 'home',
                  date: '2021-07-03T20:30:00.000Z',
                  tags: null,
                  authors: null,
                },
              },
              {
                node: {
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
                  date: '2021-07-03T20:30:00.000Z',
                  tags: null,
                  authors: null,
                },
              },
            ],
          },
        },
        {
          __typename: 'Collection',
          name: 'post',
          slug: 'post',
          path: 'content/posts',
          matches: null,
          documents: {
            totalCount: 10,
            edges: [
              {
                node: {
                  __typename: 'Post',
                  id: 'content/posts/0th-post.mdx',
                  _sys: {
                    filename: '0th-post',
                    basename: '0th-post.mdx',
                    breadcrumbs: ['0th-post'],
                    path: 'content/posts/0th-post.mdx',
                    relativePath: '0th-post.mdx',
                    extension: '.mdx',
                  },
                  slug: '0th-post',
                  date: '2021-07-03T20:30:00.000Z',
                  tags: null,
                  authors: null,
                },
              },
              {
                node: {
                  __typename: 'Post',
                  id: 'content/posts/1th-post.mdx',
                  _sys: {
                    filename: '1th-post',
                    basename: '1th-post.mdx',
                    breadcrumbs: ['1th-post'],
                    path: 'content/posts/1th-post.mdx',
                    relativePath: '1th-post.mdx',
                    extension: '.mdx',
                  },
                  slug: '1th-post',
                  date: '2021-07-03T20:30:00.000Z',
                  tags: null,
                  authors: null,
                },
              },
              {
                node: {
                  __typename: 'Post',
                  id: 'content/posts/2th-post.mdx',
                  _sys: {
                    filename: '2th-post',
                    basename: '2th-post.mdx',
                    breadcrumbs: ['2th-post'],
                    path: 'content/posts/2th-post.mdx',
                    relativePath: '2th-post.mdx',
                    extension: '.mdx',
                  },
                  slug: '2th-post',
                  date: '2021-07-03T20:30:00.000Z',
                  tags: null,
                  authors: null,
                },
              },
              {
                node: {
                  __typename: 'Post',
                  id: 'content/posts/3th-post.mdx',
                  _sys: {
                    filename: '3th-post',
                    basename: '3th-post.mdx',
                    breadcrumbs: ['3th-post'],
                    path: 'content/posts/3th-post.mdx',
                    relativePath: '3th-post.mdx',
                    extension: '.mdx',
                  },
                  slug: '3th-post',
                  date: '2021-07-03T20:30:00.000Z',
                  tags: [
                    {
                      tag: {
                        id: 'content/tags/tag-1.mdx',
                        _sys: { filename: 'tag-1' },
                        name: 'Tag 1',
                        date: '2021-07-03T20:30:00.000Z',
                        slug: 'tag-1',
                      },
                    },
                  ],
                  authors: [
                    {
                      author: {
                        id: 'content/authors/pedro.mdx',
                        _sys: { filename: 'pedro' },
                        name: 'Pedro',
                        date: '2021-07-03T20:30:00.000Z',
                        slug: 'pedro',
                      },
                    },
                  ],
                },
              },
              {
                node: {
                  __typename: 'Post',
                  id: 'content/posts/4th-post.mdx',
                  _sys: {
                    filename: '4th-post',
                    basename: '4th-post.mdx',
                    breadcrumbs: ['4th-post'],
                    path: 'content/posts/4th-post.mdx',
                    relativePath: '4th-post.mdx',
                    extension: '.mdx',
                  },
                  slug: '4th-post',
                  date: '2021-07-03T20:30:00.000Z',
                  tags: [
                    {
                      tag: {
                        id: 'content/tags/tag-2.mdx',
                        _sys: { filename: 'tag-2' },
                        name: 'Tag 2',
                        date: '2021-07-03T20:30:00.000Z',
                        slug: 'tag-2',
                      },
                    },
                  ],
                  authors: [
                    {
                      author: {
                        id: 'content/authors/napolean.mdx',
                        _sys: { filename: 'napolean' },
                        name: 'Napolean',
                        date: '2021-07-03T20:30:00.000Z',
                        slug: 'napolean',
                      },
                    },
                  ],
                },
              },
              {
                node: {
                  __typename: 'Post',
                  id: 'content/posts/5th-post.mdx',
                  _sys: {
                    filename: '5th-post',
                    basename: '5th-post.mdx',
                    breadcrumbs: ['5th-post'],
                    path: 'content/posts/5th-post.mdx',
                    relativePath: '5th-post.mdx',
                    extension: '.mdx',
                  },
                  slug: '5th-post',
                  date: '2021-07-03T20:30:00.000Z',
                  tags: null,
                  authors: null,
                },
              },
              {
                node: {
                  __typename: 'Post',
                  id: 'content/posts/6th-post.mdx',
                  _sys: {
                    filename: '6th-post',
                    basename: '6th-post.mdx',
                    breadcrumbs: ['6th-post'],
                    path: 'content/posts/6th-post.mdx',
                    relativePath: '6th-post.mdx',
                    extension: '.mdx',
                  },
                  slug: '6th-post',
                  date: '2021-07-12T07:00:00.000Z',
                  tags: null,
                  authors: null,
                },
              },
              {
                node: {
                  __typename: 'Post',
                  id: 'content/posts/7th-post.mdx',
                  _sys: {
                    filename: '7th-post',
                    basename: '7th-post.mdx',
                    breadcrumbs: ['7th-post'],
                    path: 'content/posts/7th-post.mdx',
                    relativePath: '7th-post.mdx',
                    extension: '.mdx',
                  },
                  slug: '7th-post',
                  date: '2021-07-03T20:30:00.000Z',
                  tags: [
                    {
                      tag: {
                        id: 'content/tags/tag-1.mdx',
                        _sys: { filename: 'tag-1' },
                        name: 'Tag 1',
                        date: '2021-07-03T20:30:00.000Z',
                        slug: 'tag-1',
                      },
                    },
                    {
                      tag: {
                        id: 'content/tags/tag-2.mdx',
                        _sys: { filename: 'tag-2' },
                        name: 'Tag 2',
                        date: '2021-07-03T20:30:00.000Z',
                        slug: 'tag-2',
                      },
                    },
                  ],
                  authors: [
                    {
                      author: {
                        id: 'content/authors/napolean.mdx',
                        _sys: { filename: 'napolean' },
                        name: 'Napolean',
                        date: '2021-07-03T20:30:00.000Z',
                        slug: 'napolean',
                      },
                    },
                    {
                      author: {
                        id: 'content/authors/pedro.mdx',
                        _sys: { filename: 'pedro' },
                        name: 'Pedro',
                        date: '2021-07-03T20:30:00.000Z',
                        slug: 'pedro',
                      },
                    },
                  ],
                },
              },
              {
                node: {
                  __typename: 'Post',
                  id: 'content/posts/8th-post.mdx',
                  _sys: {
                    filename: '8th-post',
                    basename: '8th-post.mdx',
                    breadcrumbs: ['8th-post'],
                    path: 'content/posts/8th-post.mdx',
                    relativePath: '8th-post.mdx',
                    extension: '.mdx',
                  },
                  slug: '8th-post',
                  date: '2021-07-03T20:30:00.000Z',
                  tags: null,
                  authors: null,
                },
              },
              {
                node: {
                  __typename: 'Post',
                  id: 'content/posts/9th-post.mdx',
                  _sys: {
                    filename: '9th-post',
                    basename: '9th-post.mdx',
                    breadcrumbs: ['9th-post'],
                    path: 'content/posts/9th-post.mdx',
                    relativePath: '9th-post.mdx',
                    extension: '.mdx',
                  },
                  slug: '9th-post',
                  date: '2021-07-03T20:30:00.000Z',
                  tags: null,
                  authors: null,
                },
              },
            ],
          },
        },
        {
          __typename: 'Collection',
          name: 'author',
          slug: 'author',
          path: 'content/authors',
          matches: null,
          documents: {
            totalCount: 2,
            edges: [
              {
                node: {
                  __typename: 'Author',
                  id: 'content/authors/napolean.mdx',
                  _sys: {
                    filename: 'napolean',
                    basename: 'napolean.mdx',
                    breadcrumbs: ['napolean'],
                    path: 'content/authors/napolean.mdx',
                    relativePath: 'napolean.mdx',
                    extension: '.mdx',
                  },
                  slug: 'napolean',
                  name: 'Napolean',
                  date: '2021-07-03T20:30:00.000Z',
                },
              },
              {
                node: {
                  __typename: 'Author',
                  id: 'content/authors/pedro.mdx',
                  _sys: {
                    filename: 'pedro',
                    basename: 'pedro.mdx',
                    breadcrumbs: ['pedro'],
                    path: 'content/authors/pedro.mdx',
                    relativePath: 'pedro.mdx',
                    extension: '.mdx',
                  },
                  slug: 'pedro',
                  name: 'Pedro',
                  date: '2021-07-03T20:30:00.000Z',
                },
              },
            ],
          },
        },
        {
          __typename: 'Collection',
          name: 'tag',
          slug: 'tag',
          path: 'content/tags',
          matches: null,
          documents: {
            totalCount: 2,
            edges: [
              {
                node: {
                  __typename: 'Tag',
                  id: 'content/tags/tag-1.mdx',
                  _sys: {
                    filename: 'tag-1',
                    basename: 'tag-1.mdx',
                    breadcrumbs: ['tag-1'],
                    path: 'content/tags/tag-1.mdx',
                    relativePath: 'tag-1.mdx',
                    extension: '.mdx',
                  },
                  slug: 'tag-1',
                  name: 'Tag 1',
                  date: '2021-07-03T20:30:00.000Z',
                },
              },
              {
                node: {
                  __typename: 'Tag',
                  id: 'content/tags/tag-2.mdx',
                  _sys: {
                    filename: 'tag-2',
                    basename: 'tag-2.mdx',
                    breadcrumbs: ['tag-2'],
                    path: 'content/tags/tag-2.mdx',
                    relativePath: 'tag-2.mdx',
                    extension: '.mdx',
                  },
                  slug: '',
                  name: 'Tag 2',
                  date: '2021-07-03T20:30:00.000Z',
                },
              },
            ],
          },
        },
      ],
    },
  })
}

export const getPost = ({
  relativePath,
}: {
  relativePath: string
}): ApiResultAsync<{ data: GetPostQuery }> => {
  return okAsync(
    {
      '0th-post.mdx': {
        data: {
          config: {
            id: 'content/config/index.json',
            darkMode: true,
          },
          post: {
            __typename: 'Post' as const,
            id: `content/posts/${relativePath}`,
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
      },
      '1th-post.mdx': {
        data: {
          config: {
            id: 'content/config/index.json',
            darkMode: true,
          },
          post: {
            __typename: 'Post' as const,
            id: `content/posts/${relativePath}`,
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
      },
      '2th-post.mdx': {
        data: {
          config: {
            id: 'content/config/index.json',
            darkMode: true,
          },
          post: {
            __typename: 'Post' as const,
            id: `content/posts/${relativePath}`,
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
      },
      '3th-post.mdx': {
        data: {
          config: {
            id: 'content/config/index.json',
            darkMode: true,
          },
          post: {
            __typename: 'Post' as const,
            id: `content/posts/${relativePath}`,
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
                __typename: 'PostTags' as const,
                tag: {
                  __typename: 'Tag' as const,
                  id: 'content/tags/tag-1.mdx',
                  name: 'Tag 1',
                  date: '2021-07-03T20:30:00.000Z',
                  slug: 'tag-1',
                },
              },
            ],
            authors: [
              {
                __typename: 'PostAuthors' as const,
                author: {
                  __typename: 'Author' as const,
                  id: 'content/authors/pedro.mdx',
                  name: 'Pedro',
                  date: '2021-07-03T20:30:00.000Z',
                  slug: 'pedro',
                },
              },
            ],
          },
        },
      },
      '4th-post.mdx': {
        data: {
          config: {
            id: 'content/config/index.json',
            darkMode: true,
          },
          post: {
            __typename: 'Post' as const,
            id: `content/posts/${relativePath}`,
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
          },
        },
      },
      '5th-post.mdx': {
        data: {
          config: {
            id: 'content/config/index.json',
            darkMode: true,
          },
          post: {
            __typename: 'Post' as const,
            id: `content/posts/${relativePath}`,
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
      },
      '6th-post.mdx': {
        data: {
          config: {
            id: 'content/config/index.json',
            darkMode: true,
          },
          post: {
            __typename: 'Post' as const,
            id: `content/posts/${relativePath}`,
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
      },
      '7th-post.mdx': {
        data: {
          config: {
            id: 'content/config/index.json',
            darkMode: true,
          },
          post: {
            __typename: 'Post' as const,
            id: `content/posts/${relativePath}`,
            tags: [
              {
                __typename: 'PostTags' as const,
                tag: {
                  __typename: 'Tag' as const,
                  id: 'content/tags/tag-1.mdx',
                  name: 'Tag 1',
                  date: '2021-07-03T20:30:00.000Z',
                  slug: 'tag-1',
                },
              },
            ],
            authors: [
              {
                __typename: 'PostAuthors' as const,
                author: {
                  __typename: 'Author' as const,
                  id: 'content/authors/pedro.mdx',
                  name: 'Pedro',
                  date: '2021-07-03T20:30:00.000Z',
                  slug: 'pedro',
                },
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
      },
      '8th-post.mdx': {
        data: {
          config: {
            id: 'content/config/index.json',
            darkMode: true,
          },
          post: {
            __typename: 'Post' as const,
            id: `content/posts/${relativePath}`,
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
      },
      '9th-post.mdx': {
        data: {
          config: {
            id: 'content/config/index.json',
            darkMode: true,
          },
          post: {
            __typename: 'Post' as const,
            id: `content/posts/${relativePath}`,
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
      },
    }[relativePath]!
  )
}

export const getPage = (): ApiResultAsync<{ data: GetPageQuery }> => {
  return okAsync({
    data: {
      config: {
        id: 'content/config/index.json',
        darkMode: true,
      },
      page: {
        __typename: 'Page',
        id: 'content/pages/home.mdx',
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
  })
}

export const getAuthor = (): ApiResultAsync<{ data: GetAuthorQuery }> => {
  return okAsync({
    data: {
      author: {
        __typename: 'Author',
        id: 'content/authors/pedro.mdx',
        name: 'Pedro',
        date: '2021-07-03T20:30:00.000Z',
        slug: 'pedro',
      },
      config: {
        id: 'content/config/index.json',
        darkMode: true,
      },
    },
  })
}

export const getTag = (): ApiResultAsync<{ data: GetTagQuery }> => {
  return okAsync({
    data: {
      tag: {
        __typename: 'Tag',
        id: 'content/tags/tag-1.mdx',
        name: 'Tag -1',
        date: '2021-07-03T20:30:00.000Z',
        slug: 'tag-1',
      },
      config: {
        id: 'content/config/index.json',
        darkMode: true,
      },
    },
  })
}

export const getConfig = (): ApiResultAsync<{ data: GetConfigQuery }> => {
  return okAsync({
    data: {
      config: {
        id: 'content/config/index.json',
        darkMode: true,
      },
    },
  })
}
