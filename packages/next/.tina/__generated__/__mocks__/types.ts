import type {
  GetResourcesQuery,
  GetPostQuery,
  GetPageQuery,
  GetAuthorQuery,
  GetTagQuery,
  GetConfigQuery,
} from '../types'

export const ExperimentalGetTinaClient = () => {
  return {
    getResources: async (): Promise<{ data: GetResourcesQuery }> => {
      return {
        data: {
          __typename: 'Query',
          getCollections: [
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
                      __typename: 'ConfigDocument',
                      id: 'content/config/index.json',
                      sys: {
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
                      __typename: 'PageDocument',
                      id: 'content/pages/about.mdx',
                      sys: {
                        filename: 'about',
                        basename: 'about.mdx',
                        breadcrumbs: ['about'],
                        path: 'content/pages/about.mdx',
                        relativePath: 'about.mdx',
                        extension: '.mdx',
                      },
                      data: {
                        slug: null,
                        date: null,
                        tags: null,
                        authors: null,
                      },
                    },
                  },
                  {
                    node: {
                      __typename: 'PageDocument',
                      id: 'content/pages/home.mdx',
                      sys: {
                        filename: 'home',
                        basename: 'home.mdx',
                        breadcrumbs: ['home'],
                        path: 'content/pages/home.mdx',
                        relativePath: 'home.mdx',
                        extension: '.mdx',
                      },
                      data: {
                        slug: null,
                        date: null,
                        tags: null,
                        authors: null,
                      },
                    },
                  },
                  {
                    node: {
                      __typename: 'PageDocument',
                      id: 'content/pages/portfolio.mdx',
                      sys: {
                        filename: 'portfolio',
                        basename: 'portfolio.mdx',
                        breadcrumbs: ['portfolio'],
                        path: 'content/pages/portfolio.mdx',
                        relativePath: 'portfolio.mdx',
                        extension: '.mdx',
                      },
                      data: {
                        slug: null,
                        date: null,
                        tags: null,
                        authors: null,
                      },
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
                      __typename: 'PostDocument',
                      id: 'content/posts/0th-post.mdx',
                      sys: {
                        filename: '0th-post',
                        basename: '0th-post.mdx',
                        breadcrumbs: ['0th-post'],
                        path: 'content/posts/0th-post.mdx',
                        relativePath: '0th-post.mdx',
                        extension: '.mdx',
                      },
                      data: {
                        slug: null,
                        date: '2021-07-03T20:30:00.000Z',
                        tags: null,
                        authors: null,
                      },
                    },
                  },
                  {
                    node: {
                      __typename: 'PostDocument',
                      id: 'content/posts/1th-post.mdx',
                      sys: {
                        filename: '1th-post',
                        basename: '1th-post.mdx',
                        breadcrumbs: ['1th-post'],
                        path: 'content/posts/1th-post.mdx',
                        relativePath: '1th-post.mdx',
                        extension: '.mdx',
                      },
                      data: {
                        slug: null,
                        date: '2021-07-03T20:30:00.000Z',
                        tags: null,
                        authors: null,
                      },
                    },
                  },
                  {
                    node: {
                      __typename: 'PostDocument',
                      id: 'content/posts/2th-post.mdx',
                      sys: {
                        filename: '2th-post',
                        basename: '2th-post.mdx',
                        breadcrumbs: ['2th-post'],
                        path: 'content/posts/2th-post.mdx',
                        relativePath: '2th-post.mdx',
                        extension: '.mdx',
                      },
                      data: {
                        slug: null,
                        date: '2021-07-03T20:30:00.000Z',
                        tags: null,
                        authors: null,
                      },
                    },
                  },
                  {
                    node: {
                      __typename: 'PostDocument',
                      id: 'content/posts/3th-post.mdx',
                      sys: {
                        filename: '3th-post',
                        basename: '3th-post.mdx',
                        breadcrumbs: ['3th-post'],
                        path: 'content/posts/3th-post.mdx',
                        relativePath: '3th-post.mdx',
                        extension: '.mdx',
                      },
                      data: {
                        slug: null,
                        date: '2021-07-03T20:30:00.000Z',
                        tags: [
                          {
                            tag: {
                              id: 'content/tags/tag-1.mdx',
                              sys: { filename: 'tag-1' },
                              data: { name: 'Tag 1', date: null, slug: null },
                            },
                          },
                        ],
                        authors: [
                          {
                            author: {
                              id: 'content/authors/pedro.mdx',
                              sys: { filename: 'pedro' },
                              data: { name: 'Pedro', date: null, slug: null },
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    node: {
                      __typename: 'PostDocument',
                      id: 'content/posts/4th-post.mdx',
                      sys: {
                        filename: '4th-post',
                        basename: '4th-post.mdx',
                        breadcrumbs: ['4th-post'],
                        path: 'content/posts/4th-post.mdx',
                        relativePath: '4th-post.mdx',
                        extension: '.mdx',
                      },
                      data: {
                        slug: null,
                        date: '2021-07-03T20:30:00.000Z',
                        tags: [
                          {
                            tag: {
                              id: 'content/tags/tag-2.mdx',
                              sys: { filename: 'tag-2' },
                              data: { name: 'Tag 2', date: null, slug: '' },
                            },
                          },
                        ],
                        authors: [
                          {
                            author: {
                              id: 'content/authors/napolean.mdx',
                              sys: { filename: 'napolean' },
                              data: {
                                name: 'Napolean',
                                date: null,
                                slug: null,
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    node: {
                      __typename: 'PostDocument',
                      id: 'content/posts/5th-post.mdx',
                      sys: {
                        filename: '5th-post',
                        basename: '5th-post.mdx',
                        breadcrumbs: ['5th-post'],
                        path: 'content/posts/5th-post.mdx',
                        relativePath: '5th-post.mdx',
                        extension: '.mdx',
                      },
                      data: {
                        slug: null,
                        date: '2021-07-03T20:30:00.000Z',
                        tags: null,
                        authors: null,
                      },
                    },
                  },
                  {
                    node: {
                      __typename: 'PostDocument',
                      id: 'content/posts/6th-post.mdx',
                      sys: {
                        filename: '6th-post',
                        basename: '6th-post.mdx',
                        breadcrumbs: ['6th-post'],
                        path: 'content/posts/6th-post.mdx',
                        relativePath: '6th-post.mdx',
                        extension: '.mdx',
                      },
                      data: {
                        slug: null,
                        date: '2021-07-12T07:00:00.000Z',
                        tags: null,
                        authors: null,
                      },
                    },
                  },
                  {
                    node: {
                      __typename: 'PostDocument',
                      id: 'content/posts/7th-post.mdx',
                      sys: {
                        filename: '7th-post',
                        basename: '7th-post.mdx',
                        breadcrumbs: ['7th-post'],
                        path: 'content/posts/7th-post.mdx',
                        relativePath: '7th-post.mdx',
                        extension: '.mdx',
                      },
                      data: {
                        slug: null,
                        date: '2021-07-03T20:30:00.000Z',
                        tags: [
                          {
                            tag: {
                              id: 'content/tags/tag-1.mdx',
                              sys: { filename: 'tag-1' },
                              data: { name: 'Tag 1', date: null, slug: null },
                            },
                          },
                          {
                            tag: {
                              id: 'content/tags/tag-2.mdx',
                              sys: { filename: 'tag-2' },
                              data: { name: 'Tag 2', date: null, slug: '' },
                            },
                          },
                        ],
                        authors: [
                          {
                            author: {
                              id: 'content/authors/napolean.mdx',
                              sys: { filename: 'napolean' },
                              data: {
                                name: 'Napolean',
                                date: null,
                                slug: null,
                              },
                            },
                          },
                          {
                            author: {
                              id: 'content/authors/pedro.mdx',
                              sys: { filename: 'pedro' },
                              data: { name: 'Pedro', date: null, slug: null },
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    node: {
                      __typename: 'PostDocument',
                      id: 'content/posts/8th-post.mdx',
                      sys: {
                        filename: '8th-post',
                        basename: '8th-post.mdx',
                        breadcrumbs: ['8th-post'],
                        path: 'content/posts/8th-post.mdx',
                        relativePath: '8th-post.mdx',
                        extension: '.mdx',
                      },
                      data: {
                        slug: null,
                        date: '2021-07-03T20:30:00.000Z',
                        tags: null,
                        authors: null,
                      },
                    },
                  },
                  {
                    node: {
                      __typename: 'PostDocument',
                      id: 'content/posts/9th-post.mdx',
                      sys: {
                        filename: '9th-post',
                        basename: '9th-post.mdx',
                        breadcrumbs: ['9th-post'],
                        path: 'content/posts/9th-post.mdx',
                        relativePath: '9th-post.mdx',
                        extension: '.mdx',
                      },
                      data: {
                        slug: null,
                        date: '2021-07-03T20:30:00.000Z',
                        tags: null,
                        authors: null,
                      },
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
                      __typename: 'AuthorDocument',
                      id: 'content/authors/napolean.mdx',
                      sys: {
                        filename: 'napolean',
                        basename: 'napolean.mdx',
                        breadcrumbs: ['napolean'],
                        path: 'content/authors/napolean.mdx',
                        relativePath: 'napolean.mdx',
                        extension: '.mdx',
                      },
                      data: { slug: null, name: 'Napolean', date: null },
                    },
                  },
                  {
                    node: {
                      __typename: 'AuthorDocument',
                      id: 'content/authors/pedro.mdx',
                      sys: {
                        filename: 'pedro',
                        basename: 'pedro.mdx',
                        breadcrumbs: ['pedro'],
                        path: 'content/authors/pedro.mdx',
                        relativePath: 'pedro.mdx',
                        extension: '.mdx',
                      },
                      data: { slug: null, name: 'Pedro', date: null },
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
                      __typename: 'TagDocument',
                      id: 'content/tags/tag-1.mdx',
                      sys: {
                        filename: 'tag-1',
                        basename: 'tag-1.mdx',
                        breadcrumbs: ['tag-1'],
                        path: 'content/tags/tag-1.mdx',
                        relativePath: 'tag-1.mdx',
                        extension: '.mdx',
                      },
                      data: { slug: 'tag-1', name: 'Tag 1', date: null },
                    },
                  },
                  {
                    node: {
                      __typename: 'TagDocument',
                      id: 'content/tags/tag-2.mdx',
                      sys: {
                        filename: 'tag-2',
                        basename: 'tag-2.mdx',
                        breadcrumbs: ['tag-2'],
                        path: 'content/tags/tag-2.mdx',
                        relativePath: 'tag-2.mdx',
                        extension: '.mdx',
                      },
                      data: { slug: '', name: 'Tag 2', date: null },
                    },
                  },
                ],
              },
            },
          ],
        },
      }
    },

    getPost: async ({
      relativePath,
    }: {
      relativePath: string
    }): Promise<{ data: GetPostQuery }> =>
      ({
        '0th-post.mdx': {
          data: {
            getConfigDocument: {
              id: 'content/config/index.json',
              data: {
                darkMode: true,
              },
            },
            getPostDocument: {
              __typename: 'PostDocument' as const,
              id: `content/posts/${relativePath}`,
              data: {
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
        },
        '1th-post.mdx': {
          data: {
            getConfigDocument: {
              id: 'content/config/index.json',
              data: {
                darkMode: true,
              },
            },
            getPostDocument: {
              __typename: 'PostDocument' as const,
              id: `content/posts/${relativePath}`,
              data: {
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
                date: '2021-07-03T20:30:00.000Z',
                content: {
                  type: 'root',
                  children: [],
                },
              },
            },
          },
        },
        '2th-post.mdx': {
          data: {
            getConfigDocument: {
              id: 'content/config/index.json',
              data: {
                darkMode: true,
              },
            },
            getPostDocument: {
              __typename: 'PostDocument' as const,
              id: `content/posts/${relativePath}`,
              data: {
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
                date: '2021-07-03T20:30:00.000Z',
                content: {
                  type: 'root',
                  children: [],
                },
              },
            },
          },
        },
        '3th-post.mdx': {
          data: {
            getConfigDocument: {
              id: 'content/config/index.json',
              data: {
                darkMode: true,
              },
            },
            getPostDocument: {
              __typename: 'PostDocument' as const,
              id: `content/posts/${relativePath}`,
              data: {
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
                date: '2021-07-03T20:30:00.000Z',
                content: {
                  type: 'root',
                  children: [],
                },
              },
            },
          },
        },
        '4th-post.mdx': {
          data: {
            getConfigDocument: {
              id: 'content/config/index.json',
              data: {
                darkMode: true,
              },
            },
            getPostDocument: {
              __typename: 'PostDocument' as const,
              id: `content/posts/${relativePath}`,
              data: {
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
        },
        '5th-post.mdx': {
          data: {
            getConfigDocument: {
              id: 'content/config/index.json',
              data: {
                darkMode: true,
              },
            },
            getPostDocument: {
              __typename: 'PostDocument' as const,
              id: `content/posts/${relativePath}`,
              data: {
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
        },
        '6th-post.mdx': {
          data: {
            getConfigDocument: {
              id: 'content/config/index.json',
              data: {
                darkMode: true,
              },
            },
            getPostDocument: {
              __typename: 'PostDocument' as const,
              id: `content/posts/${relativePath}`,
              data: {
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
        },
        '7th-post.mdx': {
          data: {
            getConfigDocument: {
              id: 'content/config/index.json',
              data: {
                darkMode: true,
              },
            },
            getPostDocument: {
              __typename: 'PostDocument' as const,
              id: `content/posts/${relativePath}`,
              data: {
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
        },
        '8th-post.mdx': {
          data: {
            getConfigDocument: {
              id: 'content/config/index.json',
              data: {
                darkMode: true,
              },
            },
            getPostDocument: {
              __typename: 'PostDocument' as const,
              id: `content/posts/${relativePath}`,
              data: {
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
        },
        '9th-post.mdx': {
          data: {
            getConfigDocument: {
              id: 'content/config/index.json',
              data: {
                darkMode: true,
              },
            },
            getPostDocument: {
              __typename: 'PostDocument' as const,
              id: `content/posts/${relativePath}`,
              data: {
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
        },
      }[relativePath]),
    getPage: async (): Promise<{ data: GetPageQuery }> => ({
      data: {
        getConfigDocument: {
          id: 'content/config/index.json',
          data: {
            darkMode: true,
          },
        },
        getPageDocument: {
          __typename: 'PageDocument',
          id: 'content/pages/home.mdx',
          data: {
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
      },
    }),
    getAuthor: async (): Promise<{ data: GetAuthorQuery }> => undefined,
    getTag: async (): Promise<{ data: GetTagQuery }> => undefined,
    getConfig: async (): Promise<{ data: GetConfigQuery }> => ({
      data: {
        getConfigDocument: {
          id: 'content/config/index.json',
          data: {
            darkMode: true,
          },
        },
      },
    }),
  }
}
