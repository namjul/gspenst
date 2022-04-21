import { z } from 'zod'
import { ok, err } from 'neverthrow'
import * as Errors from '../errors'
import type { GetAuthor } from '../api'
import type { Get, SetOptional, Result } from '../types'
import type { Author as AuthorGenerated } from '../../.tina/__generated__/types'

export const authorSchema = z
  .object({
    id: z.string(), // TODO z.uuid()
    name: z.string(),
    date: z.string(),
    slug: z.string(),
  })
  .strict()

export function convert(
  getAuthorDocument: SetOptional<
    Get<GetAuthor, 'data.getAuthorDocument'>,
    '__typename'
  >
): Result<Author> {
  const {
    id,
    data: { __typename, ...restPageAuthor },
  } = getAuthorDocument

  const author = {
    id,
    ...restPageAuthor,
  }

  const result = authorSchema.safeParse(author)
  if (result.success) {
    return ok(result.data)
  } else {
    return err(Errors.other('Convert Author', result.error))
  }
}

type Author = z.infer<typeof authorSchema>

export type { Author, GetAuthor, AuthorGenerated }
