export const ExperimentalGetTinaClient = () => {
  return {
    getResources: async () => {
      return {
        data: {
          getConfigDocument: {
            id: 'content/config/index.json',
            data: { darkMode: true },
          },
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
                      id: 'content/pages/about.md',
                      sys: {
                        filename: 'about',
                        basename: 'about.md',
                        breadcrumbs: ['about'],
                        path: 'content/pages/about.md',
                        relativePath: 'about.md',
                        extension: '.md',
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
                      id: 'content/pages/home.md',
                      sys: {
                        filename: 'home',
                        basename: 'home.md',
                        breadcrumbs: ['home'],
                        path: 'content/pages/home.md',
                        relativePath: 'home.md',
                        extension: '.md',
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
                              id: 'content/tags/tag-1.md',
                              data: { name: 'Tag 1', date: null, slug: null },
                            },
                          },
                        ],
                        authors: [
                          {
                            author: {
                              id: 'content/authors/pedro.md',
                              data: {
                                name: 'Pedro',
                                date: null,
                                slug: 'pedro',
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
                              id: 'content/tags/tag-2.md',
                              data: { name: 'Tag 2', date: null, slug: '' },
                            },
                          },
                        ],
                        authors: [
                          {
                            author: {
                              id: 'content/authors/napolean.md',
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
                              id: 'content/tags/tag-1.md',
                              data: { name: 'Tag 1', date: null, slug: null },
                            },
                          },
                          {
                            tag: {
                              id: 'content/tags/tag-2.md',
                              data: { name: 'Tag 2', date: null, slug: '' },
                            },
                          },
                        ],
                        authors: [
                          {
                            author: {
                              id: 'content/authors/napolean.md',
                              data: {
                                name: 'Napolean',
                                date: null,
                                slug: null,
                              },
                            },
                          },
                          {
                            author: {
                              id: 'content/authors/pedro.md',
                              data: {
                                name: 'Pedro',
                                date: null,
                                slug: 'pedro',
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
                      id: 'content/authors/napolean.md',
                      sys: {
                        filename: 'napolean',
                        basename: 'napolean.md',
                        breadcrumbs: ['napolean'],
                        path: 'content/authors/napolean.md',
                        relativePath: 'napolean.md',
                        extension: '.md',
                      },
                      data: { slug: null, name: 'Napolean', date: null },
                    },
                  },
                  {
                    node: {
                      __typename: 'AuthorDocument',
                      id: 'content/authors/pedro.md',
                      sys: {
                        filename: 'pedro',
                        basename: 'pedro.md',
                        breadcrumbs: ['pedro'],
                        path: 'content/authors/pedro.md',
                        relativePath: 'pedro.md',
                        extension: '.md',
                      },
                      data: { slug: 'pedro', name: 'Pedro', date: null },
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
                      id: 'content/tags/tag-1.md',
                      sys: {
                        filename: 'tag-1',
                        basename: 'tag-1.md',
                        breadcrumbs: ['tag-1'],
                        path: 'content/tags/tag-1.md',
                        relativePath: 'tag-1.md',
                        extension: '.md',
                      },
                      data: { slug: null, name: 'Tag 1', date: null },
                    },
                  },
                  {
                    node: {
                      __typename: 'TagDocument',
                      id: 'content/tags/tag-2.md',
                      sys: {
                        filename: 'tag-2',
                        basename: 'tag-2.md',
                        breadcrumbs: ['tag-2'],
                        path: 'content/tags/tag-2.md',
                        relativePath: 'tag-2.md',
                        extension: '.md',
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

    getPost: async () => ({
      data: {
        getConfigDocument: {
          id: 'content/config/index.json',
          data: {
            darkMode: true,
          },
        },
        getPostDocument: {
          __typename: 'PostDocument',
          id: 'content/posts/3th-post.mdx',
          data: {
            title: 'Third Post',
            heroImg: null,
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
            authors: null,
            tags: null,
            date: '2021-07-03T20:30:00.000Z',
            body: {
              type: 'root',
              children: [],
            },
          },
        },
      },
      query:
        '\n    query getPost($relativePath: String!) {\n  ...ConfigQueryFragment\n  getPostDocument(relativePath: $relativePath) {\n    ...PostDocumentQueryFragment\n  }\n}\n    \n    fragment ConfigQueryFragment on Query {\n  getConfigDocument(relativePath: "index.json") {\n    id\n    data {\n      ...ConfigParts\n    }\n  }\n}\n    \n    fragment ConfigParts on Config {\n  darkMode\n}\n    \n\n    fragment PostDocumentQueryFragment on PostDocument {\n  __typename\n  id\n  data {\n    ...PostParts\n    tags {\n      tag {\n        ... on TagDocument {\n          data {\n            ...TagParts\n          }\n        }\n      }\n    }\n    authors {\n      author {\n        ... on AuthorDocument {\n          data {\n            ...AuthorParts\n          }\n        }\n      }\n    }\n  }\n}\n    \n    fragment PostParts on Post {\n  title\n  heroImg\n  excerpt\n  authors {\n    __typename\n    author {\n      ... on Document {\n        id\n      }\n    }\n  }\n  tags {\n    __typename\n    tag {\n      ... on Document {\n        id\n      }\n    }\n  }\n  date\n  body\n}\n    \n\n    fragment TagParts on Tag {\n  name\n}\n    \n\n    fragment AuthorParts on Author {\n  name\n}\n    ',
      variables: {
        relativePath: '3th-post.mdx',
      },
    }),
    getPage: async () => ({
      data: {
        getConfigDocument: {
          id: 'content/config/index.json',
          data: {
            darkMode: true,
          },
        },
        getPageDocument: {
          __typename: 'PageDocument',
          id: 'content/pages/home.md',
          data: {
            title: null,
            body: {
              type: 'root',
              children: [
                {
                  type: 'h1',
                  children: [
                    {
                      type: 'text',
                      text: 'Heading 1',
                    },
                  ],
                },
                {
                  type: 'h2',
                  children: [
                    {
                      type: 'text',
                      text: 'Heading 2',
                    },
                  ],
                },
                {
                  type: 'h3',
                  children: [
                    {
                      type: 'text',
                      text: 'Heading 3',
                    },
                  ],
                },
                {
                  type: 'h4',
                  children: [
                    {
                      type: 'text',
                      text: 'Heading 4',
                    },
                  ],
                },
                {
                  type: 'h5',
                  children: [
                    {
                      type: 'text',
                      text: 'Heading 5',
                    },
                  ],
                },
                {
                  type: 'h6',
                  children: [
                    {
                      type: 'text',
                      text: 'Heading 6',
                    },
                  ],
                },
                {
                  type: 'p',
                  children: [
                    {
                      type: 'text',
                      text: 'Paragraph',
                    },
                  ],
                },
                {
                  type: 'p',
                  children: [
                    {
                      type: 'a',
                      url: 'www.google.at',
                      children: [
                        {
                          type: 'text',
                          text: 'Link',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'p',
                  children: [
                    {
                      type: 'img',
                      url: '',
                      alt: '',
                      caption: null,
                    },
                  ],
                },
                {
                  type: 'blockquote',
                  children: [
                    {
                      type: 'p',
                      children: [
                        {
                          type: 'text',
                          text: 'Quote',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'ul',
                  children: [
                    {
                      type: 'li',
                      children: [
                        {
                          type: 'lic',
                          children: [
                            {
                              type: 'text',
                              text: '- U List',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'li',
                      children: [
                        {
                          type: 'lic',
                          children: [
                            {
                              type: 'text',
                              text: '- U List',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'li',
                      children: [
                        {
                          type: 'lic',
                          children: [
                            {
                              type: 'text',
                              text: '- U List',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'ol',
                  children: [
                    {
                      type: 'li',
                      children: [
                        {
                          type: 'lic',
                          children: [
                            {
                              type: 'text',
                              text: '- O List',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'li',
                      children: [
                        {
                          type: 'lic',
                          children: [
                            {
                              type: 'text',
                              text: '- O List',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'li',
                      children: [
                        {
                          type: 'lic',
                          children: [
                            {
                              type: 'text',
                              text: '- O List',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'p',
                  children: [
                    {
                      code: true,
                      text: 'Code',
                    },
                  ],
                },
                {
                  type: 'p',
                  children: [
                    {
                      bold: true,
                      type: 'text',
                      text: 'Bold',
                      value: 'Bold',
                    },
                  ],
                },
                {
                  type: 'code_block',
                  lang: 'js',
                  children: [
                    {
                      type: 'code_line',
                      children: [
                        {
                          type: 'text',
                          text: "console.log('Hello World')",
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'p',
                  children: [
                    {
                      italic: true,
                      type: 'text',
                      text: 'Italic',
                      value: 'Italic',
                    },
                  ],
                },
                {
                  type: 'p',
                  children: [
                    {
                      type: 'a',
                      url: 'www.google.at',
                      children: [
                        {
                          code: true,
                          text: 'text',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      },
      query:
        '\n    query getPage($relativePath: String!) {\n  ...ConfigQueryFragment\n  getPageDocument(relativePath: $relativePath) {\n    ...PageDocumentQueryFragment\n  }\n}\n    \n    fragment ConfigQueryFragment on Query {\n  getConfigDocument(relativePath: "index.json") {\n    id\n    data {\n      ...ConfigParts\n    }\n  }\n}\n    \n    fragment ConfigParts on Config {\n  darkMode\n}\n    \n\n    fragment PageDocumentQueryFragment on PageDocument {\n  __typename\n  id\n  data {\n    ...PageParts\n  }\n}\n    \n    fragment PageParts on Page {\n  title\n  body\n}\n    ',
      variables: {
        relativePath: 'home.md',
      },
    }),
    getAuthor: async () => undefined,
    getConfig: async () => ({
      data: {
        getConfigDocument: {
          id: 'content/config/index.json',
          data: {
            darkMode: true,
          },
        },
      },
      query:
        '\n    query getConfig {\n  ...ConfigQueryFragment\n}\n    \n    fragment ConfigQueryFragment on Query {\n  getConfigDocument(relativePath: "index.json") {\n    id\n    data {\n      ...ConfigParts\n    }\n  }\n}\n    \n    fragment ConfigParts on Config {\n  darkMode\n}\n    ',
      variables: {},
    }),
  }
}
