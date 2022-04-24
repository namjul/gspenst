import { Result as NeverThrowResult } from 'neverthrow'
import _nql from '@tryghost/nql'
import { ok, err } from '../shared-kernel'
import { createPost } from '../domain/post'
import { createPage } from '../domain/page'
import { createAuthor } from '../domain/author'
import { createTag } from '../domain/tag'
import { do_ } from '../utils'
import * as Errors from '../errors'
import type { Resource } from '../domain/resource'
import { absurd } from './index'

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

export function makeNqlFilter(filter: string) {
  return NeverThrowResult.fromThrowable(
    (obj: object) => {
      return _nql(filter, { expansions: EXPANSIONS }).queryJSON(obj)
    },
    (error) =>
      Errors.other(
        '`nql`#queryJSON',
        error instanceof Error ? error : undefined
      )
  )
}

export function filterResource(resource: Resource, filter: string | undefined) {
  if (!filter) {
    return ok({ resource, owned: true })
  }

  const nqlFilter = makeNqlFilter(filter)

  const { resourceType } = resource

  switch (resourceType) {
    case 'post':
      return resource.dataResult
        ? do_(() => {
            const postResult = createPost(
              resource.dataResult!.data.getPostDocument
            )
              .andThen((post) => nqlFilter(post))
              .map((owned) => ({
                resource,
                owned,
              }))
            return postResult
          })
        : err(Errors.notFound('filterResource'))
    case 'page':
      return resource.dataResult
        ? do_(() => {
            const pageResult = createPage(
              resource.dataResult!.data.getPageDocument
            )
              .andThen((page) => nqlFilter(page))
              .map((owned) => ({
                resource,
                owned,
              }))
            return pageResult
          })
        : err(Errors.notFound('filterResource'))
    case 'author':
      return resource.dataResult
        ? do_(() => {
            const authorResult = createAuthor(
              resource.dataResult!.data.getAuthorDocument
            )
              .andThen((author) => nqlFilter(author))
              .map((owned) => ({
                resource,
                owned,
              }))
            return authorResult
          })
        : err(Errors.notFound('filterResource'))
    case 'tag':
      return resource.dataResult
        ? do_(() => {
            const tagResult = createTag(
              resource.dataResult!.data.getTagDocument
            )
              .andThen((tag) => nqlFilter(tag))
              .map((owned) => ({
                resource,
                owned,
              }))
            return tagResult
          })
        : err(Errors.notFound('filterResource'))
    default:
      return absurd(resourceType)
  }
}
