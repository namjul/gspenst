import { ok } from 'neverthrow'
import repository from './repository'

jest.mock('../.tina/__generated__/types')
jest.mock('./redis')

beforeAll(async () => {
  void (await repository.init())
})

const resourceItem = {
  id: 'content/posts/0th-post.mdx',
  filename: '0th-post',
  path: 'content/posts/0th-post.mdx',
  resourceType: 'post' as const,
  relativePath: '0th-post.mdx',
  slug: '0th-post',
  year: 2022,
  month: 10,
  day: 12,
  primary_tag: 'tag-1',
  primary_author: 'tag-2',
}

describe('repository', () => {
  test('init', async () => {
    const result = await repository.init()
    expect(result.isOk()).toBe(true)
  })

  test('set', async () => {
    const result = await repository.set(resourceItem)
    expect(result.isOk()).toBe(true)
  })

  test('get single', async () => {
    const result = await repository.get('content/posts/0th-post.mdx')
    expect(result).toMatchObject(ok(resourceItem))
  })

  test('get multiple', async () => {
    const result = await repository.get([
      'content/posts/0th-post.mdx',
      'content/posts/1th-post.mdx',
    ])
    expect(result._unsafeUnwrap()).toHaveLength(2)
  })

  test('getAll', async () => {
    const result = await repository.getAll()
    expect(result._unsafeUnwrap()).toHaveLength(18)
  })

  test('find', async () => {
    const result1 = await repository.find({ slug: 'tag-1' })
    expect(result1._unsafeUnwrap()).toBeDefined()
    const result2 = await repository.find({ slug: 'tag-3' })
    expect(result2._unsafeUnwrap()).toBeUndefined()
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
