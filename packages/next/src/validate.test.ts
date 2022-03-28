import { validate } from './validate'

describe('routing object validation', () => {
  test('works with no parameter', () => {
    const object = validate()
    expect(object).toEqual({
      routes: {},
      collections: {
        '/': {
          permalink: '/:slug/',
          template: 'index',
        },
      },
      taxonomies: {
        tag: '/tag/:slug',
        author: '/author/:slug',
      },
    })
  })
  test('overwrite parameters', () => {
    const object = validate({
      routes: null,
      taxonomies: {},
    })
    expect(object).toEqual({
      routes: {},
      collections: {
        '/': {
          permalink: '/:slug/',
          template: 'index',
        },
      },
      taxonomies: {},
    })
  })
  test('throws error when using wrong fields', () => {
    expect(() => {
      validate({
        routess: {},
      })
    }).toThrow()
    expect(() => {
      validate({
        collection: {},
      })
    }).toThrow()
    expect(() => {
      validate({
        taxonomy: {},
      })
    }).toThrow()
  })

  test('throws error when using :w+ notiation in taxonomies', () => {
    expect(() => {
      validate({
        taxonomies: {
          tag: '/categories/:slug/',
        },
      })
    }).toThrow()
  })

  test('throws error when permalink is missing (collection)', () => {
    expect(() => {
      validate({
        collections: {
          permalink: '/{slug}/',
        },
      })
    }).toThrow()
  })

  it('throws error when using an undefined taxonomy', () => {
    expect(() => {
      validate({
        taxonomies: {
          sweet_baked_good: '/patisserie/{slug}',
        },
      })
    }).toThrow()
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
            permalink: '/:slug/',
            template: 'test',
          },
        },
        taxonomies: {
          tag: '/tag/:slug',
          author: '/author/:slug',
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
      expect(() => {
        validate({
          routes: {
            '/food/': {
              data: 'something.test',
            },
          },
        })
      }).toThrow('Incorrect Format. Please use e.g. tag.recipes')
    })

    test('shorform', () => {
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
            data: 'author.carsten',
          },
        },
        collections: {
          '/more/': {
            permalink: '/{slug}/',
            data: 'page.home',
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

      expect(object).toEqual({
        routes: {
          '/food/': {
            data: {
              query: {
                page: {
                  resource: 'page',
                  type: 'read',
                  options: {
                    slug: 'food',
                  },
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
            permalink: '/:slug/',
            data: {
              query: {
                page: {
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
            permalink: '/podcast/:slug/',
            data: {
              query: {
                tag: {
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
            permalink: '/:slug/',
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

        taxonomies: {
          tag: '/tag/:slug',
          author: '/author/:slug',
        },
      })
    })
  })
})
