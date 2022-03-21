// import type { RoutingConfigResolved } from './validate'
import { RouterManager } from './routing'
import { validate } from './validate'

jest.mock('../../.tina/__generated__/types')
jest.mock('../plugin')

describe('routing mapping', () => {
  test('empty config', async () => {
    const router = new RouterManager({})
    expect(await router.resolvePaths()).toEqual([
      '/about',
      '/home',
      '/portfolio',
    ])
    expect(await router.resolveProps()).toEqual(null)
  })
  test('default routing config', async () => {
    const router = new RouterManager(validate())
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
    const router = new RouterManager({
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
    })
    expect(await router.resolvePaths()).toContain('/features/')
  })
  test('collections', async () => {
    const router = new RouterManager({
      collections: {
        '/posts/': {
          permalink: '/posts/:slug/',
          template: 'index',
        },
      },
    })
    const paths = await router.resolvePaths()
    expect(paths).toContain('/posts/')
    expect(paths).toContain('/posts/first-post/')
    expect(paths).toContain('/posts/second-post/')
    const props = await router.resolveProps('posts')
    expect(props).toEqual({ props: {} })
  })
  test('taxonomies', async () => {
    const router = new RouterManager({
      taxonomies: {
        tag: '/category-1/:slug',
        author: '/category-2/:slug',
      },
    })
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
