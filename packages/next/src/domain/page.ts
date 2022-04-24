import { ok, err, z, combine } from '../shared-kernel'
import * as Errors from '../errors'
import type { GetPage } from '../api'
import type { Page as PageGenerated } from '../../.tina/__generated__/types'
import type { Get, Result } from '../shared-kernel'
import { createAuthor } from './author'
import { createTag } from './tag'
import { postSchema } from './post'

export const getPageSchema = z.custom<GetPage>((value) => value)

export const resourceType = z.literal('page')

const pageSchema = postSchema.merge(z.object({}).strict())

type Page = z.infer<typeof pageSchema>

export type { Page, GetPage, PageGenerated }

export function createPage(
  getPageDocument: Get<GetPage, 'data.getPageDocument'>
): Result<Page> {
  const {
    id,
    data: {
      __typename,
      tags: rawTags,
      authors: rawAuthors,
      date,
      ...restPageProps
    },
  } = getPageDocument

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
