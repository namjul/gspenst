import { ok, err, z } from '../shared-kernel'
import * as Errors from '../errors'
import type { GetPage } from '../api'
import type { Page as PageGenerated } from '../../.tina/__generated__/types'
import type { Get, Result } from '../shared-kernel'
import { createAuthor } from './author'
import { createTag } from './tag'
import { postSchema } from './post'

export const getPageSchema = z.custom<GetPage>((value) => value)

export const resourceType = z.literal('page')

const pageSchema = z.object({}).merge(postSchema).strict()

type Page = z.infer<typeof pageSchema>

export type { Page, GetPage, PageGenerated }

export function createPage(
  getPageDocument: Get<GetPage, 'data.getPageDocument'>
): Result<Page> {
  const {
    id,
    data: { __typename, tags, authors, ...restPageProps },
  } = getPageDocument

  const page = {
    id,
    ...restPageProps,
    tags: (tags ?? []).flatMap((tag) => {
      return tag?.tag ? createTag(tag.tag) : []
    }),
    authors: (authors ?? []).flatMap((author) => {
      return author?.author ? createAuthor(author.author) : []
    }),
  }

  const parsedPageResult = pageSchema.safeParse(page)
  if (parsedPageResult.success) {
    return ok(parsedPageResult.data)
  } else {
    return err(Errors.other('Create Page', parsedPageResult.error))
  }
}
