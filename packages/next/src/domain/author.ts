import { idSchema, ok, err, z } from '../shared-kernel'
import * as Errors from '../errors'
import type { GetAuthor } from '../api'
import type { Get, SetOptional, Result } from '../shared-kernel'
import type { Author as AuthorGenerated } from '../../.tina/__generated__/types'

export const authorSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    date: z.date(),
    slug: z.string(),
  })
  .strict()

export function createAuthor({
  id,
  __typename,
  date,
  ...restPageAuthor
}: SetOptional<Get<GetAuthor, 'data.author'>, '__typename'>): Result<Author> {
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

type Author = z.infer<typeof authorSchema>

export type { Author, GetAuthor, AuthorGenerated }
