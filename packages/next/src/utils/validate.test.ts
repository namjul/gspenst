import { validate } from './validate'

describe('routing object validation', () => {
  test('works with no parameter', () => {
    const object = validate()
    expect(object).toEqual({
      routes: {},
      collections: {},
      taxonomies: {},
    })
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
    }).toThrow('this field has unspecified keys: foo')
    expect(() => {
      validate({
        collections: {
          '/': {
            foo: 'bar',
          },
        },
      })
    }).toThrow('this field has unspecified keys: foo')
    expect(() => {
      validate({
        taxonomies: {
          sweet_baked_good: '/patisserie/{slug}',
        },
      })
    }).toThrow('this field has unspecified keys: sweet_baked_good')
  })

  test('no validation error for routes', () => {
    validate({
      routes: {
        '/': {
          template: 'hier',
        },
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
        taxonomies: {},
      })
    })
  })

  // describe('data definitions', () => {
  //   const object = validate({
  //     routes: {
  //       '/food/': {
  //         data: 'tag.food',
  //       },
  //       '/music/': {
  //         data: 'tag.music',
  //       },
  //       '/ghost/': {
  //         data: 'author.ghost',
  //       },
  //       '/sleep/': {
  //         data: {
  //           bed: 'tag.bed',
  //           dream: 'tag.dream',
  //         },
  //       },
  //       '/lala/': {
  //         data: 'author.carsten',
  //       },
  //     },
  //     collections: {
  //       '/more/': {
  //         permalink: '/{slug}/',
  //         data: {
  //           home: 'page.home',
  //         },
  //       },
  //       '/podcast/': {
  //         permalink: '/podcast/{slug}/',
  //         data: {
  //           something: 'tag.something',
  //         },
  //       },
  //       '/': {
  //         permalink: '/{slug}/',
  //         data: 'tag.sport',
  //       },
  //     },
  //   })
  // })
})
