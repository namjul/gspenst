import repository from '../repository'
import { format } from '../errors'
import { filterResource } from './filterResource'
import { processQuery } from './processQuery'

jest.mock('../api')
jest.mock('../redis')

beforeAll(async () => {
  const result = await repository.collect()
  if (result.isErr()) {
    throw format(result.error)
  }
})

describe('filterResource', () => {
  test('primary_tag:tag-1', async () => {
    const query = {
      resourceType: 'post',
      type: 'read',
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain --- TODO: return ErrResult if `slug` is not defined
      slug: '7th-post',
      redirect: false,
    } as const
    const { resource } = (await processQuery(query))._unsafeUnwrap()
    const result = filterResource(resource, 'primary_tag:tag-1')
    expect(result._unsafeUnwrap().owned).toBe(true)
  })

  test('primary_tag:tag-2', async () => {
    const query = {
      resourceType: 'post',
      type: 'read',
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain --- TODO: return ErrResult if `slug` is not defined
      slug: '7th-post',
      redirect: false,
    } as const
    const { resource } = (await processQuery(query))._unsafeUnwrap()
    const result = filterResource(resource, 'primary_tag:tag-2')
    expect(result._unsafeUnwrap().owned).toBe(false)
  })
})
