import { idSchema, ok, err, z } from '../shared-kernel'
import * as Errors from '../errors'
import type { Result, Get } from '../shared-kernel'
import type { TagResource } from './resource'

export const tagSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    date: z.date(),
    slug: z.string(),
  })
  .strict()

export function createTag(tagData: NonNullable<Get<TagResource, 'tinaData.data.tag'>>): Result<Tag> {
  const { id, __typename, date, ...restPageTag } = tagData
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

export type Tag = z.infer<typeof tagSchema>
