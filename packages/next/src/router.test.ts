import { RouterManager } from './router'

describe('routing mapping', () => {
  test('empty config', () => {
    const router = new RouterManager({})
    expect(router.handle('about')).toEqual([
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
  })

  test('taxonomies', () => {
    const router = new RouterManager({
      taxonomies: {
        tag: '/category-1/:slug',
        author: '/category-2/:slug',
      },
    })
    expect(router.handle(['category-2', 'pedro'])).toEqual([
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
    ])
  })

  test('paging', () => {
    const router = new RouterManager({
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
    expect(router.handle(['page', '1'])).toEqual([
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
    ])
    expect(router.handle(['author', 'pedro', 'page', '1'])).toEqual([
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
    ])
  })
  test('redirect route', () => {
    const router = new RouterManager({
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
    expect(router.handle(['about', 'team'])).toMatchObject([
      {
        type: 'custom',
        request: {
          path: '/about/team/',
        },
        templates: ['team'],
      },
    ])
    expect(router.handle(['about'])).toEqual([
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
      {
        type: 'redirect',
        destination: '/about/team',
        statusCode: 301,
      },
    ])
    expect(router.handle(['4th-post'])).toEqual([
      {
        type: 'redirect',
        destination: '/about/team',
        statusCode: 301,
      },
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
    expect(router.handle(['home'])).toEqual([
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
      {
        type: 'redirect',
        destination: '/',
        statusCode: 301,
      },
    ])
    expect(router.handle(['author', 'pedro'])).toEqual([
      {
        type: 'redirect',
        destination: '/about/team',
        statusCode: 301,
      },
    ])
    expect(router.handle(['5th-post'])).toEqual([
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
  })
})
