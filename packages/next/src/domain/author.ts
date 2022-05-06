import { idSchema, ok, err, z } from '../shared-kernel'
import * as Errors from '../errors'
import type { Result, Get } from '../shared-kernel'
import type { AuthorResource } from './resource'

export const authorSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    date: z.date(),
    slug: z.string(),
  })
  .strict()

export function createAuthor(authorData: NonNullable<Get<AuthorResource, 'tinaData.data.author'>>): Result<Author> {
  const { id, __typename, date, ...restPageAuthor } =
    authorData

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

