import { ok } from 'neverthrow'
import { validate } from './validate'

describe('routing object validation & transformation', () => {
  describe('validation', () => {
    test('works with no parameter', () => {
      const object = validate()
      expect(object.isOk()).toBe(true)
    })
    test('throws error when using wrong fields', () => {
      expect(
        validate({
          routess: {},
        }).isErr()
      ).toBe(true)
      expect(
        validate({
          collection: {},
        }).isErr()
      ).toBe(true)
      expect(
        validate({
          taxonomy: {},
        }).isErr()
      ).toBe(true)
    })

    test('throws error when using :w+ notiation in taxonomies', () => {
      expect(
        validate({
          taxonomies: {
            tag: '/categories/:slug/',
          },
        }).isErr()
      ).toBe(true)
    })

    test('throws error when permalink is missing (collection)', () => {
      expect(
        validate({
          collections: {
            permalink: '/{slug}/',
          },
        }).isErr()
      ).toBe(true)
    })

    it('throws error when using an undefined taxonomy', () => {
      expect(
        validate({
          taxonomies: {
            sweet_baked_good: '/patisserie/{slug}',
          },
        }).isErr()
      ).toBe(true)
    })

    test('throws error when using wrong field properties', () => {
      expect(
        validate({
          routes: {
            '/': {
              foo: 'bar',
            },
          },
        }).isErr()
      ).toBe(true)
      expect(
        validate({
          routes: {
            '/': '',
          },
        }).isErr()
      ).toBe(true)
      expect(
        validate({
          collections: {
            '/': {
              foo: 'bar',
            },
          },
        }).isErr()
      ).toBe(true)
      expect(
        validate({
          taxonomies: {
            sweet_baked_good: '/patisserie/{slug}',
          },
        }).isErr()
      ).toBe(true)
    })

    test('no validation error for routes', () => {
      expect(
        validate({
          routes: {
            '/home/': 'bar',
          },
        }).isOk()
      ).toBe(true)
    })

    describe('data property', () => {
      test('throws error when using wrong data', () => {
        expect(
          validate({
            routes: {
              '/food/': {
                data: 'tag:test',
              },
            },
          }).isErr()
        ).toBe(true)
        expect(
          validate({
            routes: {
              '/food/': {
                data: 'something.test',
              },
            },
          }).isErr()
        ).toBe(true)
        expect(
          validate({
            routes: {
              '/food/': {
                data: 234,
              },
            },
          }).isErr()
        ).toBe(true)
        expect(
          validate({
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
          validate({
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
          validate({
            routes: {
              '/food/': {
                data: {
                  something: {
                    resourceType: 'post',
                  },
                },
              },
            },
          }).isErr()
        ).toBe(true)
        expect(
          validate({
            routes: {
              '/food/': {
                data: {
                  something: {
                    resourceType: 'posts',
                  },
                },
              },
            },
          }).isErr()
        ).toBe(true)
        expect(
          validate({
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
      })
    })
  })
  describe('transformation', () => {
    describe('template property', () => {
      test('single value', () => {
        const object = validate({
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
                },
                '/me/': {
                  template: 'me',
                },
              },
              collections: {
                '/': {
                  permalink: '/:slug/',
                  template: 'test',
                },
              },
              taxonomies: {},
            },
          ])
        )
      })
    })

    test('shortform', () => {
      const object = validate({
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
            },
          },
        },
        collections: {
          '/more/': {
            permalink: '/{slug}/',
            data: 'page.home',
            filter: 'tags:[photo, video] + id:-5',
            limit: 4,
          },
          '/podcast/': {
            permalink: '/podcast/{slug}/',
            data: 'tag.something',
          },
          '/': {
            permalink: '/{slug}/',
            data: 'tag.sport',
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
                template: 'Page',
              },
              '/music/': {
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
                data: {
                  query: {
                    carsten: {
                      resourceType: 'author',
                      type: 'read',
                      slug: 'carsten',
                      redirect: true,
                    },
                  },
                  router: {
                    author: [{ redirect: true, slug: 'carsten' }],
                  },
                },
              },
            },
            collections: {
              '/more/': {
                permalink: '/:slug/',
                filter: 'tags:[photo, video] + id:-5',
                limit: 4,
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
            taxonomies: {},
          },
        ])
      )
    })

    test('longform', () => {
      const object = validate({
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
            collections: {},
            taxonomies: {},
          },
        ])
      )
    })
  })
})
