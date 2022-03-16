// import type { RoutingConfigResolved } from './validate'
import { createRoutingMap } from './routing'

jest.mock('../../.tina/__generated__/types')

describe('routing mapping', () => {
  test('empty config', async () => {
    const routingMap = await createRoutingMap()
    expect(routingMap.paths).toEqual({})
    expect(routingMap.redirects).toEqual([])
  })
  test('routes', async () => {
    const routingMap = await createRoutingMap({
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

    expect(routingMap).toEqual({
      paths: { features: { template: 'Features' } },
      redirects: [],
    })
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
