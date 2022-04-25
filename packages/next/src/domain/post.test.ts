import { getProperty } from 'dot-prop'
import { combine } from '../shared-kernel'
import repository from '../repository'
import type { ID } from '../shared-kernel'
import { format } from '../errors'
import { createPost } from './post'

jest.mock('../../.tina/__generated__/types')
jest.mock('../redis')

beforeAll(async () => {
  const result = await combine([repository.collect(), repository.getAll()])
  if (result.isErr()) {
    throw format(result.error)
  }
})

describe('post model', () => {
  test('createPost', async () => {
    const resource = await repository.get(1824064168 as ID)
    const getPostDocument = getProperty(
      resource._unsafeUnwrap(),
      'tinaData.data.getPostDocument'
    )
    expect(createPost(getPostDocument!).isOk()).toBe(true)
  })
})
