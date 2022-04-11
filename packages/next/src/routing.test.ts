import { RouterManager } from './routing'
import { resources } from './__fixtures__/resources'

describe('routing mapping', () => {
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
      options: {},
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
      templates: ['index'],
      type: 'entry',
    })
  })
})
