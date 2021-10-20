import path from 'path'
import mock from 'mock-fs'
import { getData, getEntries, getEntry } from './helper'

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

test('get all nodes', async () => {
  const nodes = await getEntries()
  expect(nodes).toHaveLength(41)
})

test('get all nodes for specific source type', async () => {
  const nodes = await getEntries('post')
  expect(nodes).toHaveLength(10)
})

test('gets a node using slug', async () => {
  const author = await getEntry('author', 'ujtecoci')
  expect(author?.name).toBe('Kevin Clarke')
})
