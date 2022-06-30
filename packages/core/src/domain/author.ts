import { idSchema, pathSchema, dateSchema, z } from '../shared/kernel'
import type { Result } from '../shared/kernel'
import { parse } from '../helpers/parser'
import type { AuthorResource } from './resource'

export const authorSchema = z
  .object({
    type: z.literal('author'),
    id: idSchema,
    name: z.string(),
    date: dateSchema,
    slug: z.string(),
    url: pathSchema,
  })
  .strict()

authorSchema.describe('authorSchema')

export type Author = z.infer<typeof authorSchema>

export function createAuthor(authorResource: AuthorResource): Result<Author> {
  const { tinaData, path } = authorResource
  const {
    author: { __typename, _sys, ...author },
  } = tinaData.data

  return parse(authorSchema, {
    type: 'author',
    ...author,
    url: path ?? `/${authorResource.id}`,
  })
}
