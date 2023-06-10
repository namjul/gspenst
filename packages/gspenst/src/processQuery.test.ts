import repository from './repository'
import { format } from './errors'
import { createLoaders, processQuery } from './processQuery'

jest.mock('./api')
jest.mock('./redis')

const dataLoaders = createLoaders()

beforeAll(async () => {
  const result = await repository.collect({
    collections: {
      '/': {
        permalink: '/{slug}',
        filter: 'slug:-8th-post',
        limit: 5,
      },
    },
  })
  if (result.isErr()) {
    throw format(result.error)
  }
})

describe('processQuery', () => {
  describe('read', () => {
    test('simple', async () => {
      const query = {
        resourceType: 'post',
        type: 'read',
        slug: '7th-post',
        redirect: false,
      } as const
      const result = (await processQuery(dataLoaders, query))._unsafeUnwrap()
      expect(result).toHaveProperty('resource')
    })
  })

  describe('browse', () => {
    test('simple', async () => {
      const query = {
        type: 'browse',
        resourceType: 'post',
        limit: 5,
      } as const
      const result = (await processQuery(dataLoaders, query))._unsafeUnwrap()
      expect(result).toHaveProperty('resources')
      expect(result).toHaveProperty('pagination')
      expect(result).toHaveProperty('pagination.total', 10)
      expect(result).toHaveProperty('resources[0].id', 57892423)
    })

    test('all', async () => {
      const query = {
        type: 'browse',
        resourceType: 'post',
        limit: 'all',
      } as const
      const result = (await processQuery(dataLoaders, query))._unsafeUnwrap()
      expect(result.resources).toHaveLength(10)
    })

    test('filter', async () => {
      const query = {
        type: 'browse',
        resourceType: 'post',
        filter: 'slug:-8th-post',
        limit: 5,
      } as const
      const result = (await processQuery(dataLoaders, query))._unsafeUnwrap()
      expect(result).toHaveProperty('resources')
      expect(result).toHaveProperty('pagination')
      expect(result).toHaveProperty('pagination.total', 9)
    })

    test('limit', async () => {
      const query = {
        type: 'browse',
        resourceType: 'post',
        limit: 3,
      } as const
      const result = await processQuery(dataLoaders, query)
      expect(result._unsafeUnwrap()).toHaveProperty('pagination.total', 10)
    })

    test('order', async () => {
      const query = {
        type: 'browse' as const,
        resourceType: 'post' as const,
        limit: 3,
        order: [{ field: 'date', order: 'asc' as const }],
      }

      const result = (await processQuery(dataLoaders, query))._unsafeUnwrap()
      expect(result.resources).toHaveLength(3)
      expect(result).toHaveProperty('resources[0].id', 2502485806)
    })
  })
})
