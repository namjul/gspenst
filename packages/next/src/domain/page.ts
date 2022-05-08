import { ok, err, z, combine } from '../shared-kernel'
import * as Errors from '../errors'
import type { Result, Get } from '../shared-kernel'
import type { GetPageQuery } from '../../.tina/__generated__/types'
import { createAuthor } from './author'
import { createTag } from './tag'
import { postSchema } from './post'

export const pageSchema = postSchema.merge(z.object({}).strict())

export type Page = z.infer<typeof pageSchema>

export function createPage(pageData: Get<GetPageQuery, 'page'> & { _sys?: object }): Result<Page> {
  const {
    id,
    __typename,
    _sys,
    tags: rawTags,
    authors: rawAuthors,
    date,
    ...restPageProps
  } = pageData

  const tagsResult = combine(
    (rawTags ?? []).flatMap((tag) => {
      if (tag?.tag) {
        return createTag(tag.tag)
      }
      return []
    })
  )

  const authorsResult = combine(
    (rawAuthors ?? []).flatMap((author) => {
      if (author?.author) {
        return createAuthor(author.author)
      }
      return []
    })
  )

  return combine([tagsResult, authorsResult]).andThen(([tags, authors]) => {
    const page = {
      id,
      ...restPageProps,
      date: new Date(date),
      tags,
      authors,
      primary_tag: tags?.[0],
      primary_author: authors?.[0],
    }

    const parsedPageResult = postSchema.safeParse(page)
    if (parsedPageResult.success) {
      return ok(parsedPageResult.data)
    } else {
      return err(Errors.other('Create Post', parsedPageResult.error))
    }
  })
}
