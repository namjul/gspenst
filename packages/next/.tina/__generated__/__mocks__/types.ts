export const ExperimentalGetTinaClient = () => {
  return {
    getResources: async () => {
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
              name: 'post',
              slug: 'post',
              path: 'content/posts',
              matches: null,
              documents: {
                totalCount: 2,
                edges: [
                  {
                    node: {
                      __typename: 'PostDocument',
                      id: 'content/posts/first-post.mdx',
                      sys: {
                        filename: 'first-post',
                        basename: 'first-post.mdx',
                        breadcrumbs: ['first-post'],
                        path: 'content/posts/first-post.mdx',
                        relativePath: 'first-post.mdx',
                        extension: '.mdx',
                      },
                    },
                  },
                  {
                    node: {
                      __typename: 'PostDocument',
                      id: 'content/posts/second-post.mdx',
                      sys: {
                        filename: 'second-post',
                        basename: 'second-post.mdx',
                        breadcrumbs: ['second-post'],
                        path: 'content/posts/second-post.mdx',
                        relativePath: 'second-post.mdx',
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
          ],
        },
      }
    },

    getPost: async () => ({}),
    getPage: async () => ({}),
    getAuthor: async () => ({}),
  }
}
