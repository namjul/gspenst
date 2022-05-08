import { idSchema, ok, err, z } from '../shared-kernel'
import * as Errors from '../errors'
import type { GetAuthorQuery } from '../../.tina/__generated__/types'
import type { Result, Get } from '../shared-kernel'

export const authorSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    date: z.date(),
    slug: z.string(),
  })
  .strict()

export function createAuthor(
  authorData: Get<GetAuthorQuery, 'author'> & { _sys?: object }
): Result<Author> {
  const { id, __typename, _sys, date, ...restPageAuthor } = authorData

  const author = {
    id,
    ...restPageAuthor,
    date: new Date(date),
  }

  const result = authorSchema.safeParse(author)
  if (result.success) {
    return ok(result.data)
  } else {
    return err(Errors.other('Create Author', result.error))
  }
}

export type Author = z.infer<typeof authorSchema>
