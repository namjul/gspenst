export const ExperimentalGetTinaClient = () => {
  return {
    getResources: async () => {
      return {
        data: {
          getConfigDocument: {
            id: 'content/config/index.json',
            data: {
              darkMode: true,
            },
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
                    },
                  },
                  {
                    node: {
                      __typename: 'PageDocument',
                      id: 'content/pages/portfolio.md',
                      sys: {
                        filename: 'portfolio',
                        basename: 'portfolio.md',
                        breadcrumbs: ['portfolio'],
                        path: 'content/pages/portfolio.md',
                        relativePath: 'portfolio.md',
                        extension: '.md',
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
                    },
                  },
                ],
              },
            },
          ],
        },
      }
    },

    getPost: async () => undefined,
    getPage: async () => undefined,
    getAuthor: async () => undefined,
  }
}
