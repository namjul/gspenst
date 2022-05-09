import { idSchema, dateSchema, ok, err, z } from '../shared-kernel'
import * as Errors from '../errors'
import type { GetTagQuery } from '../../.tina/__generated__/types'
import type { Result, Get } from '../shared-kernel'

export const tagSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    date: dateSchema,
    slug: z.string(),
  })
  .strict()

export function createTag(
  tagData: Get<GetTagQuery, 'tag'> & { _sys?: object }
): Result<Tag> {
  const { __typename, _sys, ...restPageTag } = tagData
  const tag = {
    ...restPageTag,
  }

  const result = tagSchema.safeParse(tag)
  if (result.success) {
    return ok(result.data)
  } else {
    return err(Errors.other('Create Tag', result.error))
  }
}

export type Tag = z.infer<typeof tagSchema>
