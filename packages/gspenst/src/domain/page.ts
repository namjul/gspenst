import { z } from '../shared/kernel'
import { parse } from '../helpers/parser'
import type { Result } from '../shared/kernel'
import type { PageNodeFragment } from '../../.tina/__generated__/types'
import type { RoutingMapping } from './resource'
import { postSchema, postNormalizedSchema, createPost } from './post'

export const pageSchema = postSchema.merge(
  z.object({ type: z.literal('page') })
)

pageSchema.describe('pageSchema')

export type Page = z.infer<typeof pageSchema>

export const pageNormalizedSchema = postNormalizedSchema

export type PageNormalized = z.infer<typeof pageNormalizedSchema>

export function createPage(
  node: PageNodeFragment,
  routingMapping: RoutingMapping = {}
): Result<Page> {
  return createPost(node, routingMapping)
    .map((post) => ({ ...post, type: 'page' }))
    .andThen((post) => parse(pageSchema, post))
}
