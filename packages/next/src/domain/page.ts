import { z } from '../shared-kernel'
import { parse } from '../helpers/parser'
import type { Result } from '../shared-kernel'
import type { PageResource } from './resource'
import { postSchema, postNormalizedSchema, createPost } from './post'

export const pageSchema = postSchema.merge(
  z.object({ type: z.literal('page') })
)

export type Page = z.infer<typeof pageSchema>

export const pageNormalizedSchema = postNormalizedSchema

export type PageNormalized = z.infer<typeof pageNormalizedSchema>

export function createPage(pageResource: PageResource): Result<Page> {
  return createPost(pageResource)
    .map((post) => ({ ...post, type: 'page' }))
    .andThen((post) => parse(pageSchema, post))
}
