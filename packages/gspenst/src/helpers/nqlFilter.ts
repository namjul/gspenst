import _nql from '@tryghost/nql'
import { fromThrowable } from '../shared/kernel'
import * as Errors from '../errors'

const EXPANSIONS = [
  {
    key: 'author',
    replacement: 'authors.slug',
  },
  {
    key: 'tags',
    replacement: 'tags.slug',
  },
  {
    key: 'tag',
    replacement: 'tags.slug',
  },
  {
    key: 'authors',
    replacement: 'authors.slug',
  },
  {
    key: 'primary_tag',
    replacement: 'primary_tag.slug',
  },
  {
    key: 'primary_author',
    replacement: 'primary_author.slug',
  },
]

const cache = new Map<string, ReturnType<typeof _nql>>()

export function makeNqlFilter(filter: string) {
  return fromThrowable(
    (obj: object) => {
      if (cache.has(filter)) {
        return cache.get(filter)!.queryJSON(obj)
      }
      const nqlFilter = _nql(filter, { expansions: EXPANSIONS })
      cache.set(filter, nqlFilter)
      return nqlFilter.queryJSON(obj)
    },
    (error) =>
      Errors.other(
        '`nql`#queryJSON',
        error instanceof Error ? error : undefined
      )
  )
}

