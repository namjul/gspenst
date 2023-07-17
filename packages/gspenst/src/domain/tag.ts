import {
  type SetOptional,
  type GspenstResult,
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
  .describe('tagSchema')

export type Tag = z.infer<typeof tagSchema>

export function createTag(
  node: SetOptional<TagNodeFragment, '__typename'>,
  routingMapping: RoutingMapping = {}
): GspenstResult<Tag> {
  const { id, name, date, slug } = node

  const idResult = parse(idSchema, id)

  if (idResult.isErr()) {
    return err(idResult.error)
  }

  return parse(tagSchema, {
    type: 'tag',
    id: idResult.value,
    name,
    date,
    slug,
    path: routingMapping[node._sys.path] ?? `/${idResult.value}`,
  })
}
