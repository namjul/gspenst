import type { Collection } from '../types'

export function getAllPosts(collection: Array<Collection>, type = 'post') {
  return collection.filter(({ name }) => name === type)
}
