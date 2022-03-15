import { validate } from './validate'

describe('routing object validation', () => {
  test('works with no parameter', () => {
    const object1 = validate()
    expect(object1).toEqual({})
    const object2 = validate({
      routes: null,
      collections: null,
      taxonomies: null,
    })
    expect(object2).toEqual({})
  })
  test('throws error when using wrong fields', () => {
    expect(() => {
      validate({
        routess: {},
      })
    }).toThrow('this field has unspecified keys: routess')
  })

  test('throws with wrong field types', () => {
    expect(() => {
      validate({
        routes: 123,
      })
    }).toThrow(
      'routes must be a `object` type, but the final value was: `123`.'
    )
    expect(() => {
      validate({
        collections: 123,
      })
    }).toThrow(
      'collections must be a `object` type, but the final value was: `123`.'
    )
    expect(() => {
      validate({
        taxonomies: 123,
      })
    }).toThrow(
      'taxonomies must be a `object` type, but the final value was: `123`.'
    )
  })

  test('throws error when using wrong field properties', () => {
    expect(() => {
      validate({
        routes: {
          '/': {
            foo: 'bar',
          },
        },
      })
    }).toThrow()
    expect(() => {
      validate({
        routes: {
          '/': '',
        },
      })
    }).toThrow()
    expect(() => {
      validate({
        collections: {
          '/': {
            foo: 'bar',
          },
        },
      })
    }).toThrow()
    expect(() => {
      validate({
        taxonomies: {
          sweet_baked_good: '/patisserie/{slug}',
        },
      })
    }).toThrow()
  })

  test('no validation error for routes', () => {
    validate({
      routes: {
        // '/': {
        //   template: 'hier',
        // },
        '/home/': 'bar',
      },
    })
  })

  describe('template definitions', () => {
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
      expect(object).toEqual({
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
            permalink: '/{slug}/',
            template: 'test',
          },
        },
      })
    })
  })

  describe('data definitions', () => {
    test('throws error when using wrong data', () => {
      expect(() => {
        validate({
          routes: {
            '/food/': {
              data: 'tag:test',
            },
          },
        })
      }).toThrow('Incorrect Format. Please use e.g. tag.recipes')
    })

    test('shorform', () => {
      const object = validate({
        routes: {
          '/food/': {
            data: 'tag.food',
          },
          '/music/': {
            data: 'tag.music',
          },
          '/ghost/': {
            data: 'author.ghost',
          },
          '/lala/': {
            data: 'author.carsten',
          },
        },
        collections: {
          '/more/': {
            permalink: '/{slug}/',
            data: {
              home: 'page.home',
            },
          },
          '/podcast/': {
            permalink: '/podcast/{slug}/',
            data: {
              something: 'tag.something',
            },
          },
          '/': {
            permalink: '/{slug}/',
            data: 'tag.sport',
          },
        },
      })

      expect(object).toEqual({
        routes: {
          '/food/': {
            data: {
              query: {
                tag: {
                  resource: 'tag',
                  type: 'read',
                  options: {
                    slug: 'food',
                  },
                },
              },
              router: {
                tag: [{ redirect: true, slug: 'food' }],
              },
            },
          },
          '/music/': {
            data: {
              query: {
                tag: {
                  resource: 'tag',
                  type: 'read',
                  options: {
                    slug: 'music',
                  },
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
                  resource: 'author',
                  type: 'read',
                  options: {
                    slug: 'ghost',
                  },
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
                author: {
                  resource: 'author',
                  type: 'read',
                  options: {
                    slug: 'carsten',
                  },
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
            permalink: '/{slug}/',
            data: {
              query: {
                home: {
                  resource: 'page',
                  type: 'read',
                  options: {
                    slug: 'home',
                  },
                },
              },
              router: {
                page: [{ redirect: true, slug: 'home' }],
              },
            },
          },
          '/podcast/': {
            permalink: '/podcast/{slug}/',
            data: {
              query: {
                something: {
                  resource: 'tag',
                  type: 'read',
                  options: {
                    slug: 'something',
                  },
                },
              },
              router: {
                tag: [{ redirect: true, slug: 'something' }],
              },
            },
          },
          '/': {
            permalink: '/{slug}/',
            data: {
              query: {
                tag: {
                  resource: 'tag',
                  type: 'read',
                  options: {
                    slug: 'sport',
                  },
                },
              },
              router: {
                tag: [{ redirect: true, slug: 'sport' }],
              },
            },
          },
        },
      })
    })
  })
})
