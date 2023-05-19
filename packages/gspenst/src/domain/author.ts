import {
  type GspenstResult,
  idSchema,
  pathSchema,
  dateSchema,
  z,
  err,
} from '../shared/kernel'
import { parse } from '../helpers/parser'
import { type AuthorNodeFragment } from '../.tina/__generated__/types'
import { type RoutingMapping } from '../helpers/getPageMap'

export const authorSchema = z
  .object({
    type: z.literal('author'),
    id: idSchema,
    name: z.string(),
    date: dateSchema,
    slug: z.string(),
    path: pathSchema,
  })
  .strict()

authorSchema.describe('authorSchema')

export type Author = z.infer<typeof authorSchema>

export function createAuthor(
  node: AuthorNodeFragment,
  routingMapping: RoutingMapping = {}
): GspenstResult<Author> {
  const { id, name, date, slug } = node

  const idResult = parse(idSchema, id)

  if (idResult.isErr()) {
    return err(idResult.error)
  }

  return parse(authorSchema, {
    type: 'author',
    id: idResult.value,
    name,
    date,
    slug,
    path: routingMapping[node._sys.path] ?? `/${idResult.value}`,
  })
}
