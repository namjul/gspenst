import { idSchema, ok, err, z } from '../shared-kernel'
import * as Errors from '../errors'
import type { GetAuthor } from '../api'
import type { Get, SetOptional, Result } from '../shared-kernel'
import type { Author as AuthorGenerated } from '../../.tina/__generated__/types'

export const getAuthorSchema = z.custom<GetAuthor>((value) => value)

export const resourceType = z.literal('author')

export const authorSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    date: z.date(),
    slug: z.string(),
  })
  .strict()

export function createAuthor(
  getAuthorDocument: SetOptional<
    Get<GetAuthor, 'data.getAuthorDocument'>,
    '__typename'
  >
): Result<Author> {
  const {
    id,
    data: { __typename, date, ...restPageAuthor },
  } = getAuthorDocument

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
