import resolvePaths from './resolvePaths'
import repository from './repository'
import defaultRoutes from './defaultRoutes'
import { parseRoutes } from './domain/routes'
import { format } from './errors'

jest.mock('./api')
jest.mock('./redis')

beforeAll(async () => {
  const result = await repository.collect()
  if (result.isErr()) {
    throw format(result.error)
  }
  void (await repository.getAll())
})

describe('resolvePaths', () => {
  describe('resolving paths', () => {
    test('empty config', async () => {
      const result = (await resolvePaths({}))._unsafeUnwrap()
      expect(result).toEqual(['/admin', '/about', '/home', '/portfolio'])
    })
    test('default routing config', async () => {
      const result = await resolvePaths(
        parseRoutes(defaultRoutes)._unsafeUnwrap()[0]!
      )
      expect(result._unsafeUnwrap()).toEqual([
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
        '/about',
        '/home',
        '/portfolio',
        '/tag/tag-1',
        '/tag/tag-2',
        '/author/napolean',
        '/author/pedro',
      ])
    })
    test('routes', async () => {
      expect(
        (
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
        )._unsafeUnwrap()
      ).toContain('/features/')
    })
    test('routes#channel', async () => {
      expect(
        (
          await resolvePaths({
            routes: {
              '/features/': {
                controller: 'channel',
                filter: 'primary_tag:-tag-1',
              },
            },
          })
        )._unsafeUnwrap()
      ).toEqual([
        '/admin',
        '/features/',
        '/features/page/1',
        '/about',
        '/home',
        '/portfolio',
      ])
    })
    test('collections', async () => {
      const paths = await resolvePaths({
        collections: {
          '/': {
            permalink: '/:slug/',
            template: 'index',
            filter: 'primary_tag:tag-1',
            limit: undefined,
            order: undefined,
          },
          '/posts/': {
            permalink: '/posts/:slug/',
            template: 'index',
            filter: undefined,
            limit: undefined,
            order: undefined,
          },
        },
      })
      expect(paths._unsafeUnwrap()).toEqual([
        '/admin',
        '/',
        '/7th-post/',
        '/3th-post/',
        '/posts/',
        '/posts/9th-post/',
        '/posts/8th-post/',
        '/posts/6th-post/',
        '/posts/5th-post/',
        '/posts/4th-post/',
        '/posts/2th-post/',
        '/posts/1th-post/',
        '/posts/0th-post/',
        '/posts/page/1',
        '/about',
        '/home',
        '/portfolio',
      ])
    })
    test('taxonomies', async () => {
      const paths = (
        await resolvePaths({
          taxonomies: {
            tag: '/category-1/:slug',
            author: '/category-2/:slug',
          },
        })
      )._unsafeUnwrap()
      expect(paths).toContain('/category-2/napolean')
      expect(paths).toContain('/category-2/pedro')
    })
  })
})
