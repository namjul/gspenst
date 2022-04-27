import { getProperty } from 'dot-prop'
import repository from '../repository'
import { processQuery } from '../helpers/processQuery'
import { format } from '../errors'
import { createPost } from './post'

jest.mock('../redis')
jest.mock('../api')

beforeAll(async () => {
  const result = await repository.collect()
  if (result.isErr()) {
    throw format(result.error)
  }
})

describe('post model', () => {
  test('createPost', async () => {
    const query = {
      resourceType: 'post',
      type: 'read',
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain --- TODO: return ErrResult if `slug` is not defined
      slug: '7th-post',
      redirect: false,
    } as const

    const { resource } = (await processQuery(query))._unsafeUnwrap()

    const getPostDocument = getProperty(
      resource,
      'tinaData.data.getPostDocument'
    )
    expect(createPost(getPostDocument!).isOk()).toBe(true)
  })
})
