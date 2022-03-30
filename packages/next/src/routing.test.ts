import { RouterManager } from './routing'
import { validate } from './validate'
import type { ResourceItem } from './data-utils'

jest.mock('../.tina/__generated__/types')

const resources: ResourceItem[] = [
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
]

describe('routing mapping', () => {
  test('empty config', async () => {
    const router = new RouterManager({}, resources)
    expect(await router.resolvePaths()).toEqual([
      '/about',
      '/home',
      '/portfolio',
    ])
    expect(await router.resolveProps()).toEqual(null)
  })
  test('default routing config', async () => {
    const routingConfig = validate()
    const router = new RouterManager(routingConfig, resources)
    expect(await router.resolvePaths()).toEqual([
      '/',
      '/first-post/',
      '/second-post/',
      '/about',
      '/home',
      '/portfolio',
      '/author/napolean',
      '/author/pedro',
    ])
    expect(await router.resolveProps()).toEqual({ props: {} })
  })
  test('routes', async () => {
    const router = new RouterManager(
      {
        routes: {
          '/features/': {
            template: 'Features',
            data: {
              query: {
                page: {
                  type: 'read',
                  resource: 'page',
                  options: {
                    slug: 'home',
                  },
                },
              },
              router: {
                page: [{ redirect: true, slug: 'home' }],
              },
            },
          },
        },
      },
      resources
    )
    expect(await router.resolvePaths()).toContain('/features/')
  })
  test('collections', async () => {
    const router = new RouterManager(
      {
        collections: {
          '/posts/': {
            permalink: '/posts/:slug/',
            template: 'index',
          },
        },
      },
      resources
    )
    const paths = await router.resolvePaths()
    expect(paths).toContain('/posts/')
    expect(paths).toContain('/posts/first-post/')
    expect(paths).toContain('/posts/second-post/')
    const props = await router.resolveProps('posts')
    expect(props).toEqual({ props: {} })
  })
  test('taxonomies', async () => {
    const router = new RouterManager(
      {
        taxonomies: {
          tag: '/category-1/:slug',
          author: '/category-2/:slug',
        },
      },
      resources
    )
    const paths = await router.resolvePaths()
    expect(paths).toContain('/category-2/napolean')
    expect(paths).toContain('/category-2/pedro')
  })
  // test('routing config with routes', async () => {
  //   const routingConfig: RoutingConfigResolved = {
  //     routes: {
  //       '/features/': {
  //         template: 'Features',
  //       },
  //       '/about/team/': {
  //         template: 'Page',
  //         data: {
  //           query: {
  //             page: {
  //               resource: 'page',
  //               type: 'read',
  //               options: {
  //                 slug: 'about',
  //               },
  //             },
  //           },
  //           router: {
  //             page: [{ redirect: true, slug: 'about' }],
  //           },
  //         },
  //       },
  //     },
  //   }
  //   const routingMap = await createRoutingMap(routingConfig)
  //
  //   expect(routingMap).toEqual({
  //     features: {
  //       type: null,
  //       slug: 'features',
  //       template: 'Features',
  //     },
  //     'about/team': {
  //       type: null,
  //       slug: 'about/team',
  //       template: 'Page',
  //       data: 'page.about',
  //     },
  //   })
  // })
  // test('routing config with collections', async () => {
  //   const routingConfig: Routing = {
  //     collections: {
  //       '/blog/': {
  //         permalink: '/blog/{slug}',
  //         template: 'BlogLayout',
  //       },
  //     },
  //   }
  //
  //   const routingMap = await createRoutingMap(routingConfig)
  //
  //   expect(routingMap).toHaveProperty('blog', {
  //     slug: 'blog',
  //     template: 'BlogLayout',
  //     type: 'index',
  //   })
  //   expect(routingMap).toHaveProperty('blog/first-post', {
  //     slug: 'blog/first-post',
  //     path: 'content/posts/first-post.mdx',
  //     type: 'post',
  //   })
  // })
})
