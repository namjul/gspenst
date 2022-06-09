import { idSchema, urlSchema, dateSchema, z } from '../shared-kernel'
import type { Result } from '../shared-kernel'
import { parse } from '../helpers/parser'
import type { TagResource } from './resource'

export const tagSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    date: dateSchema,
    slug: z.string(),
    url: urlSchema,
  })
  .strict()

export function createTag(tagResource: TagResource): Result<Tag> {
  const { tinaData, urlPathname } = tagResource
  const {
    tag: { __typename, _sys, ...tag },
  } = tinaData.data

  return parse(tagSchema, {
    ...tag,
    url: urlPathname ?? `/${tagResource.id}`,
  })
}

export type Tag = z.infer<typeof tagSchema>
