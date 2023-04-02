import {
  type Result,
  idSchema,
  pathSchema,
  dateSchema,
  z,
  err,
} from '../shared/kernel'
import { parse } from '../helpers/parser'
import { type TagNodeFragment } from '../.tina/__generated__/types'
import { type RoutingMapping } from '../helpers/getPageMap'

export const tagSchema = z
  .object({
    type: z.literal('tag'),
    id: idSchema,
    name: z.string(),
    date: dateSchema,
    slug: z.string(),
    path: pathSchema,
  })
  .strict()

tagSchema.describe('tagSchema')

export type Tag = z.infer<typeof tagSchema>

export function createTag(
  node: TagNodeFragment,
  routingMapping: RoutingMapping = {}
): Result<Tag> {
  const { __typename, _sys, id, ...tag } = node

  const idResult = parse(idSchema, node.id)

  if (idResult.isErr()) {
    return err(idResult.error)
  }

  return parse(tagSchema, {
    id: idResult.value,
    type: 'tag',
    path: routingMapping[node._sys.path] ?? `/${idResult.value}`,
    ...tag,
  })
}
