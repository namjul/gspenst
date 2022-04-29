import { idSchema, ok, err, z } from '../shared-kernel'
import * as Errors from '../errors'
import type { GetTag } from '../api'
import type { Get, SetOptional, Result } from '../shared-kernel'
import type { Tag as TagGenerated } from '../../.tina/__generated__/types'

export const getTagSchema = z.custom<GetTag>((value) => value)

export const tagSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    date: z.date(),
    slug: z.string(),
  })
  .strict()

export function createTag({
  id,
  __typename,
  date,
  ...restPageTag
}: SetOptional<Get<GetTag, 'data.tag'>, '__typename'>): Result<Tag> {
  const tag = {
    id,
    ...restPageTag,
    date: new Date(date),
  }

  const result = tagSchema.safeParse(tag)
  if (result.success) {
    return ok(result.data)
  } else {
    return err(Errors.other('Create Tag', result.error))
  }
}

type Tag = z.infer<typeof tagSchema>

export type { Tag, GetTag, TagGenerated }
