import resolvePaths from './resolvePaths'
import { validate } from './validate'

jest.mock('./repository')

describe('resolvePaths', () => {
  describe('resolving paths', () => {
    test('empty config', async () => {
      expect(await resolvePaths({})).toEqual([
        '/admin',
        '/home',
        '/about',
        '/portfolio',
      ])
    })
    test('default routing config', async () => {
      const routingConfig = validate()
      expect(await resolvePaths(routingConfig._unsafeUnwrap()[0]!)).toEqual([
        '/admin',
        '/home',
        '/about',
        '/portfolio',
      ])
    })
    test('routes', async () => {
      expect(
        await resolvePaths({
          routes: {
            '/features/': {
              template: 'Features',
              data: {
                query: {
                  page: {
                    type: 'read',
                    resourceType: 'page',
                    slug: 'home',
                  },
                },
                router: {
                  page: [{ redirect: true, slug: 'home' }],
                },
              },
            },
          },
        })
      ).toContain('/features/')
    })
    test('collections', async () => {
      const paths = await resolvePaths({
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
      })
      expect(paths).toEqual([
        '/admin',
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
      const paths = await resolvePaths({
        taxonomies: {
          tag: '/category-1/:slug',
          author: '/category-2/:slug',
        },
      })
      expect(paths).toContain('/category-2/napolean')
      expect(paths).toContain('/category-2/pedro')
    })
  })
})
