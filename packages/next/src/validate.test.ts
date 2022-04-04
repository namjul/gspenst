import { validate } from './validate'

describe('routing object validation', () => {
  test('works with no parameter', () => {
    const object = validate()
    expect(object).toEqual({})
  })
  test('overwrite parameters', () => {
    const object = validate({
      routes: null,
      taxonomies: {},
    })
    expect(object).toEqual({
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
      expect(() => {
        validate({
          routes: {
            '/food/': {
              data: 234,
            },
          },
        })
      }).toThrow(
        'data must be a `object` type or `string`, but the final value was: `234`.'
      )
      expect(() => {
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
        })
      }).toThrow('this field has unspecified keys: resource')
      expect(() => {
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
        })
      }).toThrow('type is a required field')
      expect(() => {
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
        })
      }).toThrow(
        '`resource` has incorrect Format. Use post, page, author or tag'
      )
      expect(() => {
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
        })
      }).toThrow('`type ` has incorrect Format. Use read of brwose')
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
                  resourceType: 'page',
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
                  resourceType: 'tag',
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
                  resourceType: 'author',
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
                carsten: {
                  resourceType: 'author',
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
                  resourceType: 'page',
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
                  resourceType: 'tag',
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
                  resourceType: 'tag',
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

    test('longform', () => {
      const object = validate({
        routes: {
          '/food/': {
            data: {
              people: {
                resourceType: 'author',
                type: 'read',
                slug: 'gutelaune',
                redirect: true,
              },
            },
            template: 'Page',
          },
        },
      })

      expect(object.routes).toEqual({
        '/food/': {
          template: 'Page',
          data: {
            query: {
              people: {
                options: {
                  slug: 'gutelaune',
                },
                resourceType: 'author',
                type: 'read',
              },
            },
            router: {
              author: [
                {
                  redirect: true,
                  slug: 'gutelaune',
                },
              ],
            },
          },
        },
      })
    })
  })
})
