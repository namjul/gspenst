import { combine } from '../shared-kernel'
import repository from '../repository'
import type { DataQuery } from '../domain/routes'
import { format } from '../errors'
import { processQuery } from './processQuery'

jest.mock('../../.tina/__generated__/types')
jest.mock('../redis')

beforeAll(async () => {
  const result = await combine([repository.init(), repository.getAll()])
  if (result.isErr()) {
    throw format(result.error)
  }
})

describe('processQuery', () => {
  test('read', async () => {
    const query: DataQuery = {
      resourceType: 'post',
      type: 'read',
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain --- TODO: return ErrResult if `slug` is not defined
      slug: '7th-post',
      redirect: false,
    }

    const result = await processQuery(query)
    expect(result._unsafeUnwrap()).toHaveProperty('data')
  })

  describe('browse', () => {
    test('simple', async () => {
      const query: DataQuery = {
        type: 'browse',
        resourceType: 'post',
        isCollection: false,
      }

      const result = await processQuery(query)
      expect(result._unsafeUnwrap()).toHaveLength(10)
    })

    test('filter', async () => {
      const query: DataQuery = {
        type: 'browse',
        resourceType: 'post',
        isCollection: false,
        filter: 'slug:-8th-post',
      }

      const result = await processQuery(query)
      expect(result._unsafeUnwrap()).toHaveLength(9)
    })

    test('limit', async () => {
      const query: DataQuery = {
        type: 'browse',
        resourceType: 'post',
        isCollection: false,
        limit: 3,
        // order: routingProperties.order,
      }

      const result = await processQuery(query)
      expect(result._unsafeUnwrap()).toHaveLength(3)
    })
  })
})
