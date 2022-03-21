export const resourceMapCache = {
  get: async () => {
    return [
      {
        id: 'content/config/index.json',
        filename: 'index',
        path: 'content/config/index.json',
        slug: 'index',
        resource: 'config',
      },
      {
        id: 'content/posts/first-post.mdx',
        filename: 'first-post',
        path: 'content/posts/first-post.mdx',
        slug: 'first-post',
        resource: 'post',
      },
      {
        id: 'content/posts/second-post.mdx',
        filename: 'second-post',
        path: 'content/posts/second-post.mdx',
        slug: 'second-post',
        resource: 'post',
      },
      {
        id: 'content/authors/napolean.md',
        filename: 'napolean',
        path: 'content/authors/napolean.md',
        slug: 'napolean',
        resource: 'author',
      },
      {
        id: 'content/authors/pedro.md',
        filename: 'pedro',
        path: 'content/authors/pedro.md',
        slug: 'pedro',
        resource: 'author',
      },
      {
        id: 'content/pages/about.md',
        filename: 'about',
        path: 'content/pages/about.md',
        slug: 'about',
        resource: 'page',
      },
      {
        id: 'content/pages/home.md',
        filename: 'home',
        path: 'content/pages/home.md',
        slug: 'home',
        resource: 'page',
      },
      {
        id: 'content/pages/portfolio.md',
        filename: 'portfolio',
        path: 'content/pages/portfolio.md',
        slug: 'portfolio',
        resource: 'page',
      },
    ]
  },
}
