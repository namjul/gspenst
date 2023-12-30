// @ts-expect-error
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

type nql = (
  filter: string,
  options?: { expansions?: { key: string; replacement: string }[] }
) => {
  queryJSON: (obj: object) => boolean
  parse: () => object
}

const cache = new Map<string, ReturnType<nql>>()

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
