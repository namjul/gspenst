import { Result as NeverThrowResult } from 'neverthrow'
import _nql from '@tryghost/nql'
import { ok, err } from '../shared-kernel'
import { createPost } from '../domain/post'
import { createPage } from '../domain/page'
import { createAuthor } from '../domain/author'
import { createTag } from '../domain/tag'
import { do_, absurd } from '../utils'
import * as Errors from '../errors'
import type { Resource } from '../domain/resource'

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
  const nqlFilter = filter ? makeNqlFilter(filter) : () => ok(true)

  const { resourceType } = resource

  // TODO can be simpliefied because a resource will have the model ready
  switch (resourceType) {
    case 'post':
      return resource.tinaData
        ? do_(() => {
            const postResult = createPost(resource.tinaData!.data.post).andThen(
              (post) =>
                nqlFilter(post).map((owned) => ({
                  object: post,
                  resource,
                  owned,
                }))
            )
            return postResult
          })
        : err(Errors.notFound(`filterResource: ${resource.slug}`))
    case 'page':
      return resource.tinaData
        ? do_(() => {
            const pageResult = createPage(resource.tinaData!.data.page).andThen(
              (page) =>
                nqlFilter(page).map((owned) => ({
                  object: page,
                  resource,
                  owned,
                }))
            )
            return pageResult
          })
        : err(Errors.notFound(`filterResource: ${resource.slug}`))
    case 'author':
      return resource.tinaData
        ? do_(() => {
            const authorResult = createAuthor(
              resource.tinaData!.data.author
            ).andThen((author) =>
              nqlFilter(author).map((owned) => ({
                object: author,
                resource,
                owned,
              }))
            )
            return authorResult
          })
        : err(Errors.notFound(`filterResource: ${resource.slug}`))
    case 'tag':
      return resource.tinaData
        ? do_(() => {
            const tagResult = createTag(resource.tinaData!.data.tag).andThen(
              (tag) =>
                nqlFilter(tag).map((owned) => ({
                  object: tag,
                  resource,
                  owned,
                }))
            )
            return tagResult
          })
        : err(Errors.notFound(`filterResource: ${resource.slug}`))
    default:
      return absurd(resourceType)
  }
}
