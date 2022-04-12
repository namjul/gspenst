import { ok } from 'neverthrow'
import { controller } from './controller'
import { resources } from './__fixtures__/resources'
import repository from './repository'

jest.mock('../.tina/__generated__/types')
jest.mock('./redis')

beforeAll(async () => {
  void (await repository.init())
})

describe('controller', () => {
  describe('entry', () => {
    const type = 'entry'
    test('page', async () => {
      const resourceItem = resources['content/pages/home.md']!
      const result = await controller([
        {
          type,
          resourceType: resourceItem.resourceType,
          request: {
            path: '/home',
            params: {
              slug: 'home',
            },
          },
          templates: [],
        },
      ])
      expect(result).toMatchObject({
        props: ok({
          context: 'page',
        }),
      })
    })
    test('post', async () => {
      const resourceItem = resources['content/posts/1th-post.mdx']!
      expect(resourceItem).toBeDefined()
      const result = await controller([
        {
          type,
          resourceType: 'post',
          request: {
            path: '/posts/1th-post',
            params: {
              slug: '1th-post',
            },
          },
          templates: [],
        },
      ])
      expect(result).toMatchObject({
        props: ok({
          context: 'post',
        }),
      })
    })
    test.todo('tag')
    test.todo('author')
  })
  describe('collection', () => {
    const type = 'collection'
    test('simple', async () => {
      const result = await controller([
        {
          type,
          name: 'index',
          request: {
            path: '/',
          },
          data: {},
          templates: [],
        },
      ])
      expect(result).toMatchObject({
        props: ok({
          context: 'index',
        }),
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
