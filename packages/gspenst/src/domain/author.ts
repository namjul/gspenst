import { idSchema, pathSchema, dateSchema, z, err } from '../shared/kernel'
import type { Result } from '../shared/kernel'
import { parse } from '../helpers/parser'
import type { AuthorNodeFragment } from '../../.tina/__generated__/types'

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

export function createAuthor(node: AuthorNodeFragment): Result<Author> {
  const { __typename, _sys, id, ...author } = node

  const idResult = parse(idSchema, node.id)

  if (idResult.isErr()) {
    return err(idResult.error)
  }

  return parse(authorSchema, {
    id: idResult.value,
    type: 'author',
    path: `/${idResult.value}`,
    ...author,
  })
}
