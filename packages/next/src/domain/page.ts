import { z } from '../shared-kernel'
import { parse } from '../helpers/parser';
import type { Result } from '../shared-kernel'
import type {
  PageFragmentFragment,
} from '../../.tina/__generated__/types'
import { postSchema, createPost } from './post'

export const pageSchema = postSchema.transform(post => {
  post.page = true
  return post
})

export type Page = z.infer<typeof pageSchema>

export function createPage(pageData: Get<GetPageQuery, 'page'> & { _sys?: object }): Result<Page> {
  const {
    __typename,
    _sys,
    tags: rawTags,
    authors: rawAuthors,
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

export function createPage(pageData: PageFragmentFragment): Result<Page> {
  return createPost(pageData).andThen(post => parse(pageSchema, post))
}
