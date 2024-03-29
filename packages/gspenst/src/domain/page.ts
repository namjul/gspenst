import { z, type GspenstResult } from '../shared/kernel'
import { parse } from '../helpers/parser'
import { type PageNodeFragment } from '../.tina/__generated__/types'
import { type RoutingMapping } from '../helpers/getPageMap'
import { postSchema, postNormalizedSchema, createPost } from './post'

export const pageSchema = postSchema
  .merge(z.object({ type: z.literal('page') }))
  .describe('pageSchema')

export const pageNormalizedSchema = postNormalizedSchema.merge(
  z.object({ type: z.literal('page') })
)

export type Page = z.infer<typeof pageSchema>

export type PageNormalized = z.infer<typeof pageNormalizedSchema>

export function createPage(
  node: PageNodeFragment,
  routingMapping: RoutingMapping = {}
): GspenstResult<Page> {
  return createPost(node, routingMapping)
    .map((post) => ({ ...post, type: 'page' }))
    .andThen((post) => parse(pageSchema, post))
}
