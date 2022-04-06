import { getTemplateHierarchy } from './dataUtils'

describe('computing template hierarchy', () => {
  test('collection', () => {
    expect(
      getTemplateHierarchy({
        type: 'collection',
        name: 'index',
        request: {
          path: '/posts/',
        },
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
          slug: 'my-tag',
        },
      })
    ).toEqual(['tag-my-tag', 'tag', 'index'])
    expect(
      getTemplateHierarchy({
        type: 'channel',
        name: 'author',
        request: {
          path: '/author/napoleon/',
          slug: 'napoleon',
        },
      })
    ).toEqual(['author-napoleon', 'author', 'index'])
  })
  test('entry', () => {
    expect(
      getTemplateHierarchy({
        type: 'entry',
        resourceItem: {
          id: 'content/posts/first-post.md',
          resourceType: 'post',
        },
        request: {
          path: '/first-post/',
          slug: 'first-post',
        },
      })
    ).toEqual(['post-first-post', 'post'])
    expect(
      getTemplateHierarchy({
        type: 'entry',
        resourceItem: {
          id: 'content/pages/portfolio.md',
          resourceType: 'page',
        },
        request: {
          path: '/portfolio/',
          slug: 'portfolio',
        },
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
      })
    ).toEqual(['index'])
    expect(
      getTemplateHierarchy({
        type: 'custom',
        request: {
          path: '/team/',
        },
        templates: ['index'],
      })
    ).toEqual(['index'])
    expect(
      getTemplateHierarchy({
        type: 'custom',
        request: {
          path: '/team/',
        },
        templates: ['team'],
      })
    ).toEqual(['team', 'index'])
  })
})