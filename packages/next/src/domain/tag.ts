import { idSchema, ok, err, z } from '../shared-kernel'
import * as Errors from '../errors'
import type { GetTag } from '../api'
import type { Get, SetOptional, Result } from '../shared-kernel'
import type { Tag as TagGenerated } from '../../.tina/__generated__/types'

export const getTagSchema = z.custom<GetTag>((value) => value)

export const resourceType = z.literal('tag')

export const tagSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    date: z.string(),
    slug: z.string(),
  })
  .strict()

export function createTag(
  getTagDocument: SetOptional<Get<GetTag, 'data.getTagDocument'>, '__typename'>
): Result<Tag> {
  const {
    id,
    data: { __typename, ...restPageTag },
  } = getTagDocument

  const tag = {
    id,
    ...restPageTag,
  }

  const result = tagSchema.safeParse(tag)
  if (result.success) {
    return ok(result.data)
  } else {
    return err(Errors.other('Convert Tag', result.error))
  }
}

type Tag = z.infer<typeof tagSchema>

export type { Tag, GetTag, TagGenerated }
