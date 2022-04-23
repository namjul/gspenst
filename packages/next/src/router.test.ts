import { ok } from './shared-kernel'
import { routerManager } from './router'

describe('routing mapping', () => {
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
        tag: '/category-1/:slug',
        author: '/category-2/:slug',
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
          data: undefined,
          filter: "tags:'pedro'",
          limit: undefined,
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
          limit: undefined,
          order: undefined,
        },
      },
      taxonomies: {
        tag: '/tag/:slug',
        author: '/author/:slug',
      },
    })
    expect(router.handle(['page', '1'])).toEqual(
      ok([
        undefined,
        {
          type: 'collection',
          name: 'index',
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
    expect(router.handle(['author', 'pedro', 'page', '1'])).toEqual(
      ok([
        undefined,
        undefined,
        undefined,
        {
          type: 'channel',
          name: 'author',
          data: undefined,
          templates: [],
          filter: "tags:'pedro'",
          limit: undefined,
          order: undefined,
          request: {
            path: '/author/pedro/page/1/',
            params: {
              page: 1,
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
          limit: undefined,
          order: undefined,
        },
      },
      taxonomies: {
        tag: '/tag/:slug',
        author: '/author/:slug',
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
          destination: '/about/team',
          statusCode: 301,
        },
      ])
    )
    expect(router.handle(['4th-post'])).toEqual(
      ok([
        undefined,
        undefined,
        {
          type: 'redirect',
          destination: '/about/team',
          statusCode: 301,
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
          destination: '/',
          statusCode: 301,
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
          destination: '/about/team',
          statusCode: 301,
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
