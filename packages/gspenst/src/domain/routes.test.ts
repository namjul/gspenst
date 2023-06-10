import { ok } from '../shared/kernel'
import { parseRoutes } from './routes'

describe('GIVEN routing object', () => {
  describe('WHEN parsing', () => {
    test('THEN should work wit empty object', () => {
      const object = parseRoutes({})
      expect(object.isOk()).toBe(true)
    })

    test('THEN should validate for routes', () => {
      const result = parseRoutes({
        routes: {
          '/home/': 'bar',
        },
      })
      expect(result.isOk()).toBe(true)
    })

    test('THEN permalink transformation should be applied', () => {
      const object = parseRoutes({
        collections: null,
        routes: null,
        taxonomies: {
          tag: '/tag/{slug}',
          author: '/author/{slug}',
        },
      })
      expect(object).toEqual(
        ok([
          {
            collections: null,
            routes: null,
            taxonomies: {
              tag: {
                permalink: '/tag/:slug',
                filter: "tags:'%s'",
                limit: 5,
              },
              author: {
                permalink: '/author/:slug',
                filter: "authors:'%s'",
                limit: 5,
              },
            },
          },
        ])
      )
    })

    test('THEN template property can be string or object', () => {
      const object = parseRoutes({
        routes: {
          '/about/': 'about',
          '/me/': {
            template: 'me',
          },
        },
        collections: {
          '/': {
            permalink: '/{slug}/',
            template: 'test',
          },
        },
        taxonomies: null,
      })
      expect(object).toEqual(
        ok([
          {
            routes: {
              '/about/': {
                template: 'about',
                limit: 5,
              },
              '/me/': {
                template: 'me',
                limit: 5,
              },
            },
            collections: {
              '/': {
                permalink: '/:slug/',
                template: 'test',
                limit: 5,
              },
            },
            taxonomies: null,
          },
        ])
      )
    })

    test('THEN shortform of data property works', () => {
      const object = parseRoutes({
        routes: {
          '/food/': {
            data: 'page.food',
            template: 'Page',
          },
          '/music/': {
            data: 'tag.music',
          },
          '/ghost/': {
            data: 'author.ghost',
          },
          '/lala/': {
            data: {
              carsten: 'author.carsten',
              leo: 'author.leo',
            },
          },
        },
        collections: {
          '/more/': {
            permalink: '/{slug}/',
            data: 'page.home',
            filter: 'tags:[photo, video] + id:-5',
            limit: 4,
            order: 'featured desc, published_at desc',
          },
          '/podcast/': {
            permalink: '/podcast/{slug}/',
            data: 'tag.something',
            limit: 5,
          },
          '/': {
            permalink: '/{slug}/',
            data: 'tag.sport',
            limit: 5,
          },
        },
        taxonomies: null,
      })
      expect(object).toEqual(
        ok([
          {
            routes: {
              '/food/': {
                data: {
                  query: {
                    page: {
                      resourceType: 'page',
                      type: 'read',
                      slug: 'food',
                      redirect: true,
                    },
                  },
                  router: {
                    page: [{ redirect: true, slug: 'food' }],
                  },
                },
                limit: 5,
                template: 'Page',
              },
              '/music/': {
                limit: 5,
                data: {
                  query: {
                    tag: {
                      resourceType: 'tag',
                      type: 'read',
                      slug: 'music',
                      redirect: true,
                    },
                  },
                  router: {
                    tag: [{ redirect: true, slug: 'music' }],
                  },
                },
              },
              '/ghost/': {
                limit: 5,
                data: {
                  query: {
                    author: {
                      resourceType: 'author',
                      type: 'read',
                      slug: 'ghost',
                      redirect: true,
                    },
                  },
                  router: {
                    author: [{ redirect: true, slug: 'ghost' }],
                  },
                },
              },
              '/lala/': {
                limit: 5,
                data: {
                  query: {
                    carsten: {
                      resourceType: 'author',
                      type: 'read',
                      slug: 'carsten',
                      redirect: true,
                    },
                    leo: {
                      resourceType: 'author',
                      type: 'read',
                      slug: 'leo',
                      redirect: true,
                    },
                  },
                  router: {
                    author: [
                      { redirect: true, slug: 'carsten' },
                      { redirect: true, slug: 'leo' },
                    ],
                  },
                },
              },
            },
            collections: {
              '/more/': {
                permalink: '/:slug/',
                filter: 'tags:[photo, video] + id:-5',
                limit: 4,
                order: [
                  {
                    field: 'featured',
                    order: 'desc',
                  },
                  {
                    field: 'published_at',
                    order: 'desc',
                  },
                ],
                data: {
                  query: {
                    page: {
                      resourceType: 'page',
                      type: 'read',
                      slug: 'home',
                      redirect: true,
                    },
                  },
                  router: {
                    page: [{ redirect: true, slug: 'home' }],
                  },
                },
              },
              '/podcast/': {
                permalink: '/podcast/:slug/',
                limit: 5,
                data: {
                  query: {
                    tag: {
                      resourceType: 'tag',
                      type: 'read',
                      slug: 'something',
                      redirect: true,
                    },
                  },
                  router: {
                    tag: [{ redirect: true, slug: 'something' }],
                  },
                },
              },
              '/': {
                permalink: '/:slug/',
                limit: 5,
                data: {
                  query: {
                    tag: {
                      resourceType: 'tag',
                      type: 'read',
                      slug: 'sport',
                      redirect: true,
                    },
                  },
                  router: {
                    tag: [{ redirect: true, slug: 'sport' }],
                  },
                },
              },
            },
            taxonomies: null,
          },
        ])
      )
    })

    test('THEN lonform od data property works', () => {
      const object = parseRoutes({
        routes: {
          '/food/': {
            data: {
              people: {
                resourceType: 'author',
                type: 'read',
                slug: 'gutelaune',
                redirect: false,
              },
            },
            template: 'Page',
          },
        },
        collections: null,
        taxonomies: null,
      })

      expect(object).toEqual(
        ok([
          {
            routes: {
              '/food/': {
                template: 'Page',
                limit: 5,
                data: {
                  query: {
                    people: {
                      redirect: false,
                      slug: 'gutelaune',
                      resourceType: 'author',
                      type: 'read',
                    },
                  },
                  router: {
                    author: [
                      {
                        redirect: false,
                        slug: 'gutelaune',
                      },
                    ],
                  },
                },
              },
            },
            collections: null,
            taxonomies: null,
          },
        ])
      )
    })

    describe('AND when using wrong fields names', () => {
      test('THEN should return error result', () => {
        expect(
          parseRoutes({
            routess: {},
          }).isErr()
        ).toBe(true)
        expect(
          parseRoutes({
            collection: {},
          }).isErr()
        ).toBe(true)
        expect(
          parseRoutes({
            taxonomy: {},
          }).isErr()
        ).toBe(true)
        expect(
          parseRoutes({
            taxonomies: {
              sweet_baked_good: '/patisserie/{slug}',
            },
          }).isErr()
        ).toBe(true)
      })
    })

    describe('AND not using :w+ notation', () => {
      test('THEN returns error result', () => {
        expect(
          parseRoutes({
            taxonomies: {
              tag: '/categories/:slug/',
            },
          }).isErr()
        ).toBe(true)
      })
    })

    describe('AND required fields are missing', () => {
      test('THEN returns error result when permalink is missing in collection field', () => {
        expect(
          parseRoutes({
            collections: {
              permalink: '/{slug}/',
            },
          }).isErr()
        ).toBe(true)
      })
    })

    describe('AND when using wrong fields properties', () => {
      test('THEN return error result', () => {
        expect(
          parseRoutes({
            routes: {
              '/': {
                foo: 'bar',
              },
            },
          }).isErr()
        ).toBe(true)

        expect(
          parseRoutes({
            routes: {
              '/': 123,
            },
          }).isErr()
        ).toBe(true)

        expect(
          parseRoutes({
            collections: {
              '/': {
                foo: 'bar',
              },
            },
          }).isErr()
        ).toBe(true)

        expect(
          parseRoutes({
            routes: {
              '/food/': {
                data: 'tag:test',
              },
            },
          }).isErr()
        ).toBe(true)

        expect(
          parseRoutes({
            routes: {
              '/food/': {
                data: 'something.test',
              },
            },
          }).isErr()
        ).toBe(true)

        expect(
          parseRoutes({
            routes: {
              '/food/': {
                data: 234,
              },
            },
          }).isErr()
        ).toBe(true)

        expect(
          parseRoutes({
            routes: {
              '/food/': {
                data: {
                  something: 'something.test',
                },
              },
            },
          }).isErr()
        ).toBe(true)

        expect(
          parseRoutes({
            routes: {
              '/food/': {
                data: {
                  something: {
                    resource: 'post',
                  },
                },
              },
            },
          }).isErr()
        ).toBe(true)

        expect(
          parseRoutes({
            routes: {
              '/food/': {
                data: {
                  something: {
                    type: 'read',
                    resource: 'post',
                  },
                },
              },
            },
          }).isErr()
        ).toBe(true)

        expect(
          parseRoutes({
            routes: {
              '/food/': {
                data: {
                  something: {
                    resourceType: 'post',
                    type: 'reads',
                  },
                },
              },
            },
          }).isErr()
        ).toBe(true)

        expect(
          parseRoutes({
            routes: {
              '/food/': {
                controller: 'channel',
              },
            },
          }).isErr()
        ).toBe(true)
      })
    })
  })
})
