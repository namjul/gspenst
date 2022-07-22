import { z, idSchema } from '../shared/kernel'
import { configSchema } from './config'
import { postNormalizedSchema } from './post'
import { pageNormalizedSchema } from './page'
import { authorSchema } from './author'
import { tagSchema } from './tag'
import { resourceSchema } from './resource'

export const entitySchema = z.union([
  configSchema,
  postNormalizedSchema,
  pageNormalizedSchema,
  authorSchema,
  tagSchema,
])

export type Entity = z.infer<typeof entitySchema>

export const entriesEntitiesSchema = z
  .object({
    post: z.record(idSchema, postNormalizedSchema),
    page: z.record(idSchema, pageNormalizedSchema),
    author: z.record(idSchema, authorSchema),
    tag: z.record(idSchema, tagSchema),
    config: z.record(idSchema, configSchema),
  })
  .strict()

export const entitiesSchema = z
  .object({
    resource: z.record(idSchema, resourceSchema),
  })
  .merge(entriesEntitiesSchema)
  .strict()

export type Entities = z.infer<typeof entitiesSchema>
