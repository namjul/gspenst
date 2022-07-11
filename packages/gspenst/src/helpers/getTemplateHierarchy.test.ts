import { getTemplateHierarchy } from './getTemplateHierarchy'

describe('computing template hierarchy', () => {
  test('collection', () => {
    expect(
      getTemplateHierarchy({
        type: 'collection',
        name: 'index',
        request: {
          path: '/posts/',
        },
        templates: [],
        data: {},
        filter: undefined,
        limit: 5,
        order: undefined,
      })
    ).toEqual(['index'])
    expect(
      getTemplateHierarchy({
        type: 'collection',
        name: 'index',
        request: {
          path: '/posts/',
        },
        templates: ['index'],
        data: {},
        filter: undefined,
        limit: 5,
        order: undefined,
      })
    ).toEqual(['index'])
    expect(
      getTemplateHierarchy({
        type: 'collection',
        name: 'posts',
        request: {
          path: '/posts/',
        },
        templates: ['my-custom-template'],
        data: {},
        filter: undefined,
        limit: 5,
        order: undefined,
      })
    ).toEqual(['my-custom-template', 'posts', 'index'])
  })
  test('channel', () => {
    expect(
      getTemplateHierarchy({
        type: 'channel',
        name: 'tag',
        request: {
          path: '/tag/',
          params: {
            slug: 'my-tag',
          },
        },
        templates: [],
        data: {},
        filter: undefined,
        limit: 5,
        order: undefined,
      })
    ).toEqual(['tag-my-tag', 'tag', 'index'])
    expect(
      getTemplateHierarchy({
        type: 'channel',
        name: 'author',
        request: {
          path: '/author/napoleon/',
          params: {
            slug: 'napoleon',
          },
        },
        templates: [],
        data: {},
        filter: undefined,
        limit: 5,
        order: undefined,
      })
    ).toEqual(['author-napoleon', 'author', 'index'])
  })
  test('entry', () => {
    expect(
      getTemplateHierarchy({
        type: 'entry',
        resourceType: 'post',
        request: {
          path: '/first-post/',
          params: {
            slug: 'first-post',
          },
        },
        templates: [],
        data: {},
      })
    ).toEqual(['post-first-post', 'post'])
    expect(
      getTemplateHierarchy({
        type: 'entry',
        resourceType: 'page',
        request: {
          path: '/portfolio/',
          params: {
            slug: 'portfolio',
          },
        },
        templates: [],
        data: {},
      })
    ).toEqual(['page-portfolio', 'page', 'post'])
  })
  test('custom', () => {
    expect(
      getTemplateHierarchy({
        type: 'custom',
        request: {
          path: '/team/',
        },
        data: {},
        templates: [],
      })
    ).toEqual(['index'])
    expect(
      getTemplateHierarchy({
        type: 'custom',
        request: {
          path: '/team/',
        },
        data: {},
        templates: ['index'],
      })
    ).toEqual(['index'])
    expect(
      getTemplateHierarchy({
        type: 'custom',
        request: {
          path: '/team/',
        },
        data: {},
        templates: ['team'],
      })
    ).toEqual(['team', 'index'])
  })
})

describe('dynamic variables', () => {
  test.todo('simple')
})
