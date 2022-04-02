import { getResources } from './dataUtils'
import { controller } from './controller'

jest.mock('../.tina/__generated__/types')

describe('controller', () => {
  describe('entry', () => {
    const type = 'entry'
    test('page', async () => {
      const resources = await getResources()
      const resourceItem = resources['content/pages/about.md']!
      const result = await controller({
        type,
        resourceItem,
        request: {
          path: '/about',
          slug: 'about',
        },
      })
      expect(result).toMatchObject({
        props: {
          context: 'page',
          data: {
            page: {},
          },
        },
      })
    })
    test('post', async () => {
      const resources = await getResources()
      const resourceItem = resources['content/posts/1th-post.mdx']!
      expect(resourceItem).toBeDefined()
      const result = await controller({
        type,
        resourceItem,
        request: {
          path: '/posts/first-post',
          slug: 'first-post',
        },
      })
      expect(result).toMatchObject({
        props: {
          context: 'post',
          data: {
            post: {},
          },
        },
      })
    })
    test.todo('tag')
    test.todo('author')
  })
  describe('collection', () => {
    const type = 'collection'
    test('simple', async () => {
      const result = await controller({
        type,
        name: 'index',
        request: {
          path: '/',
        },
      })
      expect(result).toMatchObject({
        props: {
          context: 'index',
          data: {
            posts: {},
          },
        },
      })
    })
    test.todo('filter')
    test.todo('a post is only in a single collection')
    test.todo('with data')
  })
  describe('channel', () => {
    test.todo('simple')
    test.todo('filter')
    test.todo('posts can be in multiple channels')
    test.todo('with data')
  })
  describe('custom', () => {
    test.todo('simple')
    test.todo('with data')
  })
})
