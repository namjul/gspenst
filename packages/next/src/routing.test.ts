import { RouterManager } from './routing'
import { validate } from './validate'
import { resources } from './__fixtures__/resources'

describe('routing mapping', () => {
  describe('resolving paths', () => {
    test('empty config', async () => {
      const router = new RouterManager({}, resources)
      expect(await router.resolvePaths()).toEqual([
        '/home',
        '/about',
        '/portfolio',
      ])
    })
    test('default routing config', async () => {
      const routingConfig = validate()
      const router = new RouterManager(routingConfig, resources)
      expect(await router.resolvePaths()).toEqual([
        '/home',
        '/about',
        '/portfolio',
      ])
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
                    resourceType: 'page',
                    options: {
                      slug: 'home',
                      filter: undefined,
                      order: undefined,
                      limit: undefined,
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
        '/9th-post/',
        '/8th-post/',
        '/7th-post/',
        '/6th-post/',
        '/5th-post/',
        '/4th-post/',
        '/3th-post/',
        '/2th-post/',
        '/1th-post/',
        '/0th-post/',
        '/page/1',
        '/page/2',
        '/posts/',
        '/home',
        '/about',
        '/portfolio',
      ])
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
  })

  describe('handling path', () => {
    test('empty config', async () => {
      const router = new RouterManager({}, resources)
      expect(await router.handle('about')).toEqual({
        type: 'entry',
        resourceItem: {
          id: 'content/pages/about.md',
          resourceType: 'page',
        },
        request: {
          path: '/about/',
          slug: 'about',
        },
        templates: [],
      })
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
      expect(await router.handle(['category-2', 'pedro'])).toEqual({
        type: 'channel',
        name: 'author',
        templates: [],
        request: {
          path: '/category-2/pedro/',
        },
      })
    })

    test('paging', async () => {
      const router = new RouterManager(
        {
          collections: {
            '/': {
              permalink: '/:slug',
            },
          },
          taxonomies: {
            tag: '/tag/{slug}',
            author: '/author/{slug}',
          },
        },
        resources
      )
      expect(await router.handle(['page', '1'])).toEqual({
        type: 'collection',
        name: 'index',
        options: {},
        templates: [],
        request: {
          path: '/page/1/',
          page: 1,
        },
      })
      expect(await router.handle(['author', 'page', '1'])).toEqual({
        type: 'channel',
        name: 'author',
        options: {},
        templates: [],
        request: {
          path: '/author/page/1/',
          page: 1,
        },
      })
    })
    test('redirect route', async () => {
      const router = new RouterManager(
        {
          routes: {
            '/about/team': {
              template: 'team',
              data: {
                query: {},
                router: {
                  page: [
                    {
                      redirect: true,
                      slug: 'about',
                    },
                  ],
                  post: [
                    {
                      redirect: true,
                      slug: '4th-post',
                    },
                    {
                      redirect: false,
                      slug: '5th-post',
                    },
                  ],
                  author: [
                    {
                      redirect: true,
                      slug: 'pedro',
                    },
                  ],
                },
              },
            },
          },
          collections: {
            '/': {
              permalink: '/:slug',
              template: 'index',
              data: {
                query: {},
                router: {
                  page: [{ redirect: true, slug: 'home' }],
                },
              },
            },
          },
          taxonomies: {
            tag: '/tag/:slug',
            author: '/author/:slug',
          },
        },
        resources
      )
      expect(await router.handle(['about', 'team'])).toEqual({
        type: 'custom',
        request: {
          path: '/about/team/',
        },
        templates: ['team'],
      })
      expect(await router.handle(['about'])).toEqual({
        type: 'redirect',
        destination: '/about/team',
        statusCode: 301,
      })
      expect(await router.handle(['4th-post'])).toEqual({
        type: 'redirect',
        destination: '/about/team',
        statusCode: 301,
      })
      expect(await router.handle(['home'])).toEqual({
        type: 'redirect',
        destination: '/',
        statusCode: 301,
      })
      expect(await router.handle(['author', 'pedro'])).toEqual({
        type: 'redirect',
        destination: '/about/team',
        statusCode: 301,
      })
      expect(await router.handle(['5th-post'])).toEqual({
        request: {
          path: '/5th-post/',
          slug: '5th-post',
        },
        resourceItem: {
          id: 'content/posts/5th-post.mdx',
          resourceType: 'post',
        },
        templates: [],
        type: 'entry',
      })
    })
  })
})
