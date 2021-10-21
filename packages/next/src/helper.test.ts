import path from 'path'
import mock from 'mock-fs'
import { getData, getEntries, getEntry, getPaths } from './helper'
import type { Post, Author } from './types'

beforeEach(() => {
  mock({
    '.sourcebit-nextjs-cache.json': mock.load(
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
  expect(data).toHaveProperty('props')
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
  const author = await getEntry<Author>('author', 'ujtecoci')
  expect(author?.name).toBe('Kevin Clarke')
})

test('entry can be retrieved using both and context', async () => {
  const postFromSlug = await getEntry<Post>('post', 'jejvovfet')
  const postFromContext = await getEntry<Post>('post', {
    params: {
      slug: ['jejvovfet'],
    },
  })
  expect(postFromSlug?.id).toEqual(postFromContext?.id)
})

test('entries relationships are properly attached', async () => {
  const post = await getEntry<Post>('post', 'jejvovfet')
  expect(post?.slug).toBe('jejvovfet')
  expect(post?.relationships).toBeTruthy()
  expect(post?.relationships?.tag.length).toBe(2)
  expect(post?.relationships?.tag[0].name).toBe('Steve Chavez')
  expect(post?.relationships?.tag[1].name).toBe('Claudia Sullivan')
})

test('gets all paths', async () => {
  const paths = await getPaths()
  expect(paths).toHaveLength(41)
  expect(paths[0].params.slug).toBeTruthy()
})

test('get paths for specific model', async () => {
  const paths = await getPaths('post')
  expect(paths).toHaveLength(10)
  expect(paths[0].params.slug).toBeTruthy()
})
