import { ok } from '../shared-kernel'
import { parseRoutes } from './routes'

describe('routing object parsing', () => {
  describe('validation', () => {
    test('works with no parameter', () => {
      const object = parseRoutes({})
      expect(object.isOk()).toBe(true)
    })

    test('throws error when using wrong fields', () => {
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
    })

    test('throws error when using :w+ notiation in taxonomies', () => {
      expect(
        parseRoutes({
          taxonomies: {
            tag: '/categories/:slug/',
          },
        }).isErr()
      ).toBe(true)
    })

    test('throws error when permalink is missing (collection)', () => {
      expect(
        parseRoutes({
          collections: {
            permalink: '/{slug}/',
          },
        }).isErr()
      ).toBe(true)
    })

    test('throws error when using an undefined taxonomy', () => {
      expect(
        parseRoutes({
          taxonomies: {
            sweet_baked_good: '/patisserie/{slug}',
          },
        }).isErr()
      ).toBe(true)
    })

    test('throws error when using wrong field properties', () => {
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
    })

    test('no validation error for routes', () => {
      const result = parseRoutes({
        routes: {
          '/home/': 'bar',
        },
      })
      expect(result.isOk()).toBe(true)
    })

    test('throws error when using wrong data', () => {
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

  describe('transformation', () => {
    test('taxonomies', () => {
      const object = parseRoutes({
        taxonomies: {
          tag: '/tag/{slug}',
          author: '/author/{slug}',
        },
      })
      expect(object).toEqual(
        ok([
          {
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

    describe('template property', () => {
      test('single value', () => {
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
            },
          ])
        )
      })
    })

    describe('data property', () => {
      test('shortform', () => {
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
            },
          ])
        )
      })

      test('longform', () => {
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
            },
          ])
        )
      })
    })
  })
})
