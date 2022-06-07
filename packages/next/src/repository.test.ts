import repository from './repository'
import { format } from './errors'
import type { ID } from './shared-kernel'

jest.mock('./api')
jest.mock('./redis')

beforeAll(async () => {
  const result = await repository.collect()
  if (result.isErr()) {
    throw format(result.error)
  }
})

describe('repository', () => {
  test('init', async () => {
    const result = (await repository.collect())._unsafeUnwrap();
    expect(result).toHaveLength(18)
  })

  test('get single', async () => {
    const id = 57892423 as ID
    const resource = {
      id,
      filename: '0th-post',
      filepath: 'content/posts/0th-post.mdx',
      resourceType: 'post' as const,
      relativePath: '0th-post.mdx',
      slug: '0th-post',
      year: 2021,
      month: 7,
      day: 3,
      primary_tag: 'all',
      primary_author: 'all',
    }
    const result = await repository.get(id)
    expect(result._unsafeUnwrap()).toMatchObject(resource)
  })

  test('get multiple', async () => {
    const result = await repository.get([1071642883 as ID, 2502649434 as ID])
    expect(result._unsafeUnwrap()).toHaveLength(2)
    expect(result._unsafeUnwrap()[0]).toMatchObject({ id: 1071642883 })
  })

  test('getAll', async () => {
    const result = await repository.getAll()
    expect(result._unsafeUnwrap()).toHaveLength(18)
  })

  test('find', async () => {
    const result1 = await repository.find({ slug: 'tag-1' })
    expect(result1._unsafeUnwrap()).toBeDefined()
    const result2 = await repository.find({ slug: 'tag-3' })
    expect(result2.isErr()).toBe(true)
  })

  test('findAll', async () => {
    const result1 = await repository.findAll()
    expect(result1._unsafeUnwrap()).toBeDefined()
    expect(result1._unsafeUnwrap()).toHaveLength(18)

    const result2 = await repository.findAll('post')
    expect(result2._unsafeUnwrap()).toBeDefined()
    expect(result2._unsafeUnwrap()).toHaveLength(10)
  })
})
