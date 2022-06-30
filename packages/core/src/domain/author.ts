import { idSchema, urlSchema, dateSchema, z } from '../shared/kernel'
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
    url: urlSchema,
  })
  .strict()

authorSchema.describe('authorSchema')

export type Author = z.infer<typeof authorSchema>

export function createAuthor(authorResource: AuthorResource): Result<Author> {
  const { tinaData, urlPathname } = authorResource
  const {
    author: { __typename, _sys, ...author },
  } = tinaData.data

  return parse(authorSchema, {
    type: 'author',
    ...author,
    url: urlPathname ?? `/${authorResource.id}`,
  })
}
