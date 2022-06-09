import { z } from '../shared-kernel'
import { parse } from '../helpers/parser'
import type { Result } from '../shared-kernel'
import type { PageResource } from './resource'
import { postSchema, createPost } from './post'

export const pageSchema = postSchema.transform((post) => {
  post.page = true
  return post
})

export type Page = z.infer<typeof pageSchema>

export function createPage(pageResource: PageResource): Result<Page> {
  return createPost(pageResource).andThen((post) => parse(pageSchema, post))
}
