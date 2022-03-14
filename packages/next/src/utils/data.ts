import type { Split } from '@gspenst/utils'
import type { Collection, DataString } from '../types'

export function getAllPosts(collection: Array<Collection>, type = 'post') {
  return collection.filter(({ name }) => name === type)
}

export function getLocaleFromFilename(name: string) {
  const localeRegex = /\.([a-zA-Z-]+)?\.(mdx?|jsx?|json)$/
  const match = name.match(localeRegex)
  if (match) return match[1]
  return undefined
}

export function splitDataString(data: string) {
  const [resource, slug] = data.split('.') as Split<DataString, '.'>

  return {
    resource,
    slug,
  }
}
