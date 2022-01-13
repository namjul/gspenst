import path from 'path'
import mock from 'mock-fs'
import { getData, getEntries, getEntry, getPaths, getAllPaths } from './server'
import { FILE_CACHE_PATH } from './sourcebitTargetNext'
import type { Post, Author } from './types'

beforeEach(() => {
  mock({
    [FILE_CACHE_PATH]: mock.load(
      path.resolve(__dirname, '__fixtures__/data.json')
    ),
  })
})

afterEach(() => {
  mock.restore()
})

test('get data', async () => {
  const data = await getData()
  expect(data).toHaveProperty('pages')
  expect(data).toHaveProperty('entries')
})

test('get all entries', async () => {
  const nodes = await getEntries()
  expect(nodes).toHaveLength(41)
})

test('get entries for specific model', async () => {
  const nodes = await getEntries('post')
  expect(nodes).toHaveLength(10)
})

test('gets an entry using slug', async () => {
  const author = await getEntry<Author>('author', 'ovjunih')
  expect(author?.name).toBe('Danny Marsh')
})

test('entry can be retrieved using both and context', async () => {
  const postFromSlug = await getEntry<Post>('post', 'lewus')
  const postFromContext = await getEntry<Post>('post', {
    params: {
      slug: ['lewus'],
    },
  })
  expect(postFromSlug?.id).toEqual(postFromContext?.id)
})

test('entries relationships are properly attached', async () => {
  const post = await getEntry<Post>('post', 'lewus')
  expect(post?.slug).toBe('lewus')
  expect(post?.relationships).toBeTruthy()
  expect(post?.relationships?.tag.length).toBe(2)
  expect(post?.relationships?.tag[0].name).toBe('Jerome Neal')
  expect(post?.relationships?.tag[1].name).toBe('Terry Armstrong')
})

test('gets all entry paths', async () => {
  const paths = await getPaths()
  expect(paths).toHaveLength(41)
  expect(paths[0].params.slug).toBeTruthy()
})

test('get paths for specific model', async () => {
  const paths = await getPaths('post')
  expect(paths).toHaveLength(10)
  expect(paths[0].params.slug).toBeTruthy()
})

test('getAllPaths', async () => {
  const paths = await getAllPaths()
  expect(paths).toHaveLength(40)
})
