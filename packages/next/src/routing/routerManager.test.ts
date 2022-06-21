import { ok } from '../shared/kernel'
import repository from '../repository'
import { parseRoutes } from '../domain/routes'
import defaultRoutes from '../defaultRoutes'
import { filterLocatorResources } from '../helpers'
import { routerManager } from './routerManager'

jest.mock('../api')
jest.mock('../redis')

describe('router resolvePaths', () => {
  describe('resolving paths', () => {
    test('empty config', async () => {
      const routesConfig = {}
      const resources = (await repository.collect(routesConfig))._unsafeUnwrap()
      const locatorResources = resources.filter(filterLocatorResources)
      const router = routerManager(routesConfig)
      const result = router.resolvePaths(locatorResources)
      expect(result).toEqual(['/admin', '/about', '/home', '/portfolio'])
    })

    test('default routing config', async () => {
      const routesConfig = parseRoutes(defaultRoutes)._unsafeUnwrap()[0]!
      const router = routerManager(routesConfig)
      const resources = (await repository.collect(routesConfig))._unsafeUnwrap()
      const locatorResources = resources.filter(filterLocatorResources)
      const result = router.resolvePaths(locatorResources)
      expect(result).toEqual([
        '/admin',
        '/',
        '/0th-post/',
        '/1th-post/',
        '/2th-post/',
        '/3th-post/',
        '/4th-post/',
        '/5th-post/',
        '/6th-post/',
        '/7th-post/',
        '/8th-post/',
        '/9th-post/',
        '/page/1',
        '/page/2',
        '/tag/tag-1',
        '/tag/tag-2',
        '/author/napoleon',
        '/author/pedro',
        '/about',
        '/home',
        '/portfolio',
      ])
    })
  })

  test('routes', async () => {
    const routesConfig = {
      routes: {
        '/features/': {
          template: 'Features',
          limit: 5,
          data: {
            query: {
              firstpost: {
                type: 'read' as const,
                resourceType: 'post' as const,
                slug: '1th-post',
              },
              secondpost: {
                type: 'read' as const,
                resourceType: 'post' as const,
                slug: '2th-post',
                redirect: false,
              },
              home: {
                type: 'read' as const,
                resourceType: 'page' as const,
                slug: 'home',
                redirect: true,
              },
            },
            router: {
              post: [
                { redirect: true, slug: '1th-post' },
                { redirect: false, slug: '2th-post' },
              ],
              page: [{ redirect: true, slug: 'home' }],
            },
          },
        },
      },
      collections: {
        '/': {
          permalink: '/:slug',
          limit: 5,
          data: {
            query: {
              thirdpost: {
                type: 'read' as const,
                resourceType: 'post' as const,
                slug: '3th-post',
                redirect: true,
              },
              tag1: {
                type: 'read' as const,
                resourceType: 'tag' as const,
                slug: 'tag-1',
                redirect: true,
              },
            },
            router: {
              post: [{ redirect: true, slug: '3th-post' }],
              tag: [{ redirect: true, slug: 'tag-1' }],
            },
          },
        },
      },
      taxonomies: {
        tag: {
          permalink: '/tag/:slug',
          filter: "tags:'%s'" as const,
          limit: 5,
        },
        author: {
          permalink: '/author/:slug',
          filter: "authors:'%s'" as const,
          limit: 5,
        },
      },
    }
    const router = routerManager(routesConfig)
    const resources = (await repository.collect(routesConfig))._unsafeUnwrap()
    const locatorResources = resources.filter(filterLocatorResources)
    const result = router.resolvePaths(locatorResources)
    expect(result).toEqual([
      '/admin',
      '/features/',
      '/',
      '/0th-post',
      '/2th-post',
      '/4th-post',
      '/5th-post',
      '/6th-post',
      '/7th-post',
      '/8th-post',
      '/9th-post',
      '/page/1',
      '/page/2',
      '/tag/tag-2',
      '/author/napoleon',
      '/author/pedro',
      '/about',
      '/portfolio',
    ])
  })

  test('routes#channel', async () => {
    const routesConfig = {
      routes: {
        '/features/': {
          controller: 'channel' as const,
          filter: 'primary_tag:-tag-1',
          limit: 5,
        },
      },
    }
    const router = routerManager(routesConfig)
    const resources = (await repository.collect(routesConfig))._unsafeUnwrap()
    const locatorResources = resources.filter(filterLocatorResources)
    const result = router.resolvePaths(locatorResources)
    expect(result).toEqual([
      '/admin',
      '/features/',
      '/features/page/1',
      '/about',
      '/home',
      '/portfolio',
    ])
  })

  test('collections', async () => {
    const routesConfig = {
      collections: {
        '/': {
          permalink: '/:slug/',
          template: 'index',
          filter: 'primary_tag:tag-1',
          limit: 5,
          order: undefined,
        },
        '/posts/': {
          permalink: '/posts/:slug/',
          template: 'index',
          filter: undefined,
          limit: 5,
          order: undefined,
        },
      },
    }
    const router = routerManager(routesConfig)
    const resources = (await repository.collect(routesConfig))._unsafeUnwrap()
    const locatorResources = resources.filter(filterLocatorResources)
    const result = router.resolvePaths(locatorResources)
    expect(result).toEqual([
      '/admin',
      '/',
      '/3th-post/',
      '/7th-post/',
      '/posts/',
      '/posts/0th-post/',
      '/posts/1th-post/',
      '/posts/2th-post/',
      '/posts/4th-post/',
      '/posts/5th-post/',
      '/posts/6th-post/',
      '/posts/8th-post/',
      '/posts/9th-post/',
      '/posts/page/1',
      '/posts/page/2',
      '/about',
      '/home',
      '/portfolio',
    ])
  })

  test('taxonomies', async () => {
    const routesConfig = {
      taxonomies: {
        tag: {
          permalink: '/category-1/:slug',
          filter: "tags:'%s'" as const,
          limit: 5,
        },
        author: {
          permalink: '/category-2/:slug',
          filter: "authors:'%s'" as const,
          limit: 5,
        },
      },
    }
    const router = routerManager(routesConfig)
    const resources = (await repository.collect(routesConfig))._unsafeUnwrap()
    const locatorResources = resources.filter(filterLocatorResources)
    const result = router.resolvePaths(locatorResources)
    expect(result).toContain('/category-2/napoleon')
    expect(result).toContain('/category-2/pedro')
  })
})

describe('router contexts', () => {
  test('empty config', () => {
    const router = routerManager({})
    expect(router.handle('about')).toEqual(
      ok([
        undefined,
        {
          type: 'entry',
          resourceType: 'page',
          request: {
            path: '/about/',
            params: {
              slug: 'about',
            },
          },
          templates: [],
        },
      ])
    )
  })

  test('taxonomies', () => {
    const router = routerManager({
      taxonomies: {
        tag: {
          permalink: '/category-1/:slug',
          filter: "tags:'%s'" as const,
          limit: 5,
        },
        author: {
          permalink: '/category-2/:slug',
          filter: "authors:'%s'" as const,
          limit: 5,
        },
      },
    })
    expect(router.handle(['category-2', 'pedro'])).toEqual(
      ok([
        undefined,
        undefined,
        {
          type: 'channel',
          name: 'author',
          templates: [],
          data: {
            author: {
              resourceType: 'tag',
              slug: 'pedro',
              type: 'read',
            },
          },
          filter: "authors:'pedro'",
          limit: 5,
          order: undefined,
          request: {
            path: '/category-2/pedro/',
            params: {
              slug: 'pedro',
            },
          },
        },
        undefined,
      ])
    )
  })

  test('paging', () => {
    const router = routerManager({
      collections: {
        '/': {
          permalink: '/:slug',
          filter: undefined,
          limit: 5,
          order: undefined,
        },
      },
      taxonomies: {
        tag: {
          permalink: '/tag/:slug',
          filter: "tags:'%s'" as const,
          limit: 5,
        },
        author: {
          permalink: '/author/:slug',
          filter: "authors:'%s'" as const,
          limit: 5,
        },
      },
    })
    expect(router.handle(['page', '1'])).toEqual(
      ok([
        undefined,
        {
          type: 'collection',
          name: 'index',
          limit: 5,
          data: undefined,
          templates: [],
          request: {
            path: '/page/1/',
            params: {
              page: 1,
            },
          },
        },
        undefined,
        undefined,
        undefined,
      ])
    )
    expect(router.handle(['author', 'pedro'])).toEqual(
      ok([
        undefined,
        undefined,
        undefined,
        {
          type: 'channel',
          name: 'author',
          data: {
            author: {
              resourceType: 'tag',
              slug: 'pedro',
              type: 'read',
            },
          },
          templates: [],
          filter: "authors:'pedro'",
          limit: 5,
          order: undefined,
          request: {
            path: '/author/pedro/',
            params: {
              slug: 'pedro',
            },
          },
        },
        undefined,
      ])
    )
  })
  test('redirect route', () => {
    const router = routerManager({
      routes: {
        '/about/team': {
          template: 'team',
          limit: 5,
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
          filter: undefined,
          limit: 5,
          order: undefined,
        },
      },
      taxonomies: {
        tag: {
          permalink: '/tag/:slug',
          filter: "tags:'%s'" as const,
          limit: 5,
        },
        author: {
          permalink: '/author/:slug',
          filter: "authors:'%s'" as const,
          limit: 5,
        },
      },
    })
    expect(router.handle(['about', 'team'])).toMatchObject(
      ok([
        undefined,
        {
          type: 'custom',
          request: {
            path: '/about/team/',
          },
          templates: ['team'],
        },
        undefined,
        undefined,
        undefined,
        undefined,
      ])
    )
    expect(router.handle(['about'])).toEqual(
      ok([
        undefined,
        undefined,
        {
          request: {
            path: '/about/',
            params: {
              slug: 'about',
            },
          },
          resourceType: 'post',
          templates: ['index'],
          type: 'entry',
        },
        undefined,
        undefined,
        {
          type: 'redirect',
          redirect: {
            destination: '/about/team',
            permanent: true,
          },
        },
      ])
    )
    expect(router.handle(['4th-post'])).toEqual(
      ok([
        undefined,
        undefined,
        {
          type: 'redirect',
          redirect: {
            destination: '/about/team',
            permanent: true,
          },
        },
        undefined,
        undefined,
        {
          request: {
            path: '/4th-post/',
            params: {
              slug: '4th-post',
            },
          },
          resourceType: 'page',
          templates: [],
          type: 'entry',
        },
      ])
    )
    expect(router.handle(['home'])).toEqual(
      ok([
        undefined,
        undefined,
        {
          request: {
            path: '/home/',
            params: {
              slug: 'home',
            },
          },
          resourceType: 'post',
          templates: ['index'],
          type: 'entry',
        },
        undefined,
        undefined,
        {
          type: 'redirect',
          redirect: {
            destination: '/',
            permanent: true,
          },
        },
      ])
    )
    expect(router.handle(['author', 'pedro'])).toEqual(
      ok([
        undefined,
        undefined,
        undefined,
        undefined,
        {
          type: 'redirect',
          redirect: {
            destination: '/about/team',
            permanent: true,
          },
        },
        undefined,
      ])
    )
    expect(router.handle(['5th-post'])).toEqual(
      ok([
        undefined,
        undefined,
        {
          request: {
            path: '/5th-post/',
            params: {
              slug: '5th-post',
            },
          },
          resourceType: 'post',
          templates: ['index'],
          type: 'entry',
        },
        undefined,
        undefined,
        {
          request: {
            path: '/5th-post/',
            params: {
              slug: '5th-post',
            },
          },
          resourceType: 'page',
          templates: [],
          type: 'entry',
        },
      ])
    )
  })
})
