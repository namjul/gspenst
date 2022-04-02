import { RouterManager } from './routing'
import { validate } from './validate'
import { getResources } from './dataUtils'

jest.mock('../.tina/__generated__/types')

describe('routing mapping', () => {
  describe('resolving paths', () => {
    test('empty config', async () => {
      const resources = await getResources()
      const router = new RouterManager({}, resources)
      expect(await router.resolvePaths()).toEqual([
        '/about',
        '/home',
        '/portfolio',
      ])
    })
    test('default routing config', async () => {
      const resources = await getResources()
      const routingConfig = validate()
      const router = new RouterManager(routingConfig, resources)
      expect(await router.resolvePaths()).toEqual([
        '/',
        '/second-post/',
        '/first-post/',
        '/about',
        '/home',
        '/portfolio',
        '/author/napolean',
        '/author/pedro',
      ])
    })
    test('routes', async () => {
      const resources = await getResources()
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
      const resources = await getResources()
      const router = new RouterManager(
        {
          collections: {
            '/': {
              permalink: '/:slug/',
              template: 'index',
            },
            '/posts/': {
              permalink: '/posts/:slug/',
              template: 'index',
            },
          },
        },
        resources
      )
      const paths = await router.resolvePaths()
      expect(paths).toEqual([
        '/',
        '/second-post/',
        '/first-post/',
        '/posts/',
        '/about',
        '/home',
        '/portfolio',
      ])
    })
    test('taxonomies', async () => {
      const resources = await getResources()
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

  describe('handling path', () => {
    test('empty config', async () => {
      const resources = Object.values(await getResources())
      const router = new RouterManager({}, resources)
      expect(await router.handle('about')).toEqual({
        type: 'entry',
        resourceItem: {
          id: 'content/pages/about.md',
          relativePath: 'about.md',
          filename: 'about',
          path: 'content/pages/about.md',
          slug: 'about',
          resource: 'page',
        },
        request: {
          path: '/about/',
          slug: 'about',
        },
        templates: [],
      })
    })
  })
})
