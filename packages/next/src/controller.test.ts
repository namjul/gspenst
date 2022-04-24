import { ok } from './shared-kernel'
import { controller } from './controller'
import repository from './repository'
import { format } from './errors'

jest.mock('../.tina/__generated__/types')
jest.mock('./redis')

beforeAll(async () => {
  const result = await repository.init()
  if (result.isErr()) {
    throw format(result.error)
  }
})

describe('controller', () => {
  describe('entry', () => {
    const type = 'entry'
    test('page', async () => {
      const result = controller(
        ok({
          type,
          resourceType: 'page',
          request: {
            path: '/home',
            params: {
              slug: 'home',
            },
          },
          templates: [],
        })
      )
      expect(await result._unsafeUnwrap()).toMatchObject({
        props: ok({
          context: 'page',
        }),
      })
    })
    test('post', async () => {
      const result = controller(
        ok({
          type,
          resourceType: 'post',
          request: {
            path: '/posts/1th-post',
            params: {
              slug: '1th-post',
            },
          },
          templates: [],
        })
      )
      expect(await result._unsafeUnwrap()).toMatchObject({
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
      const result = controller(
        ok({
          type,
          name: 'index',
          request: {
            path: '/',
          },
          data: {},
          templates: [],
          filter: undefined,
          limit: undefined,
          order: undefined,
        })
      )
      expect(await result._unsafeUnwrap()).toMatchObject({
        props: ok({
          context: 'index',
        }),
      })
    })
    test('filter', async () => {
      const result = controller(
        ok({
          type,
          name: 'index',
          request: {
            path: '/',
          },
          data: {},
          templates: [],
          filter: 'slug:8th-post',
          limit: undefined,
          order: undefined,
        })
      )
      expect(await result._unsafeUnwrap()).toHaveProperty(
        'props.value.data.posts.resources.length',
        1
      )
    })
    test.todo('a post is only in a single collection')
    test('with data', async () => {
      const result = controller(
        ok({
          type,
          name: 'index',
          request: {
            path: '/',
          },
          data: {
            page: {
              type: 'read',
              resourceType: 'page',
              slug: 'home',
            },
          },
          templates: [],
          filter: undefined,
          limit: undefined,
          order: undefined,
        })
      )
      expect(await result._unsafeUnwrap()).toMatchObject({
        props: ok({
          context: 'index',
          data: {
            page: { resource: {} },
          },
        }),
      })
    })
  })
  describe('channel', () => {
    const type = 'channel'
    test.todo('simple')
    test('filter', async () => {
      const result = controller(
        ok({
          type,
          name: 'index',
          request: {
            path: '/',
          },
          data: {},
          templates: [],
          filter: 'slug:8th-post',
          limit: undefined,
          order: undefined,
        })
      )
      expect(await result._unsafeUnwrap()).toHaveProperty(
        'props.value.data.posts.resources.length',
        1
      )
    })
    test.todo('posts can be in multiple channels')
    test('with data', async () => {
      const result = controller(
        ok({
          type,
          name: 'index',
          request: {
            path: '/features',
          },
          data: {
            page: {
              type: 'read',
              resourceType: 'page',
              slug: 'home',
            },
          },
          templates: [],
          filter: undefined,
          limit: undefined,
          order: undefined,
        })
      )
      expect(await result._unsafeUnwrap()).toMatchObject({
        props: ok({
          context: 'index',
          data: {
            page: { resource: {} },
          },
        }),
      })
    })
  })
  describe('custom', () => {
    test.todo('simple')
    test.todo('with data')
  })
})
