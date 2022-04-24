import { combine } from '../shared-kernel'
import repository from '../repository'
import type { ID } from '../shared-kernel'
import { format } from '../errors'
import { filterResource } from './filterResource'

jest.mock('../../.tina/__generated__/types')
jest.mock('../redis')

beforeAll(async () => {
  const result = await combine([repository.init(), repository.getAll()])
  if (result.isErr()) {
    throw format(result.error)
  }
})

describe('filterResource', () => {
  test('primary_tag:tag-1', async () => {
    const resource = await repository.get(1824064168 as ID)
    const result = filterResource(resource._unsafeUnwrap(), 'primary_tag:tag-1')
    expect(result._unsafeUnwrap().owned).toBe(true)
  })

  test('primary_tag:tag-2', async () => {
    const resource = await repository.get(1824064168 as ID)
    const result = filterResource(resource._unsafeUnwrap(), 'primary_tag:tag-2')
    expect(result._unsafeUnwrap().owned).toBe(false)
  })
})
