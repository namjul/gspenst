import { resources } from './__fixtures__/resources'
import { getTemplateHierarchy, find } from './dataUtils'

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
          variables: {
            slug: 'my-tag',
          },
        },
      })
    ).toEqual(['tag-my-tag', 'tag', 'index'])
    expect(
      getTemplateHierarchy({
        type: 'channel',
        name: 'author',
        request: {
          path: '/author/napoleon/',
          variables: {
            slug: 'napoleon',
          },
        },
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
          variables: {
            slug: 'first-post',
          },
        },
      })
    ).toEqual(['post-first-post', 'post'])
    expect(
      getTemplateHierarchy({
        type: 'entry',
        resourceType: 'page',
        request: {
          path: '/portfolio/',
          variables: {
            slug: 'portfolio',
          },
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

describe('dynamic variables', () => {
  test.todo('simple')
})

describe('find', () => {
  test('simple', () => {
    const resourceItem = find(Object.values(resources), { slug: '0th-post' })
    expect(resourceItem).toMatchObject(resources['content/posts/0th-post.mdx']!)
  })
  test('complex', () => {
    const resourceItem = find(Object.values(resources), {
      year: 2022,
      // @ts-expect-error- testing with string value '11'
      month: '11',
    })
    expect(resourceItem).toMatchObject(resources['content/posts/2th-post.mdx']!)
  })
  test('returns undefined', () => {
    const resourceItem = find(Object.values(resources), {
      year: 2022,
      month: 11,
      primary_tag: 'sdf',
    })
    expect(resourceItem).toBeUndefined()
  })
})
