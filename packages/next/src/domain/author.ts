import { idSchema, dateSchema, ok, err, z } from '../shared-kernel'
import * as Errors from '../errors'
import type { Result } from '../shared-kernel'
import type { AuthorNodeFragment } from '../../.tina/__generated__/types'

export const authorSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    date: dateSchema,
    slug: z.string(),
  })
  .strict()

export function createAuthor(
  authorData: AuthorNodeFragment
): Result<Author> {
  const { __typename, _sys, ...restPageAuthor } = authorData

  const author = {
    ...restPageAuthor,
  }

  const result = authorSchema.safeParse(author)
  if (result.success) {
    return ok(result.data)
  } else {
    return err(Errors.other('Create Author', result.error))
  }
}

export type Author = z.infer<typeof authorSchema>
