import { z, idSchema } from '../shared/kernel'
import { configSchema } from './config'
import { postNormalizedSchema } from './post'
import { pageNormalizedSchema } from './page'
import { authorSchema } from './author'
import { tagSchema } from './tag'
import { resourceSchema } from './resource'

export const entriesEntitiesNormalizedSchema = z
  .object({
    post: z.record(idSchema, postNormalizedSchema),
    page: z.record(idSchema, pageNormalizedSchema),
    author: z.record(idSchema, authorSchema),
    tag: z.record(idSchema, tagSchema),
    config: z.record(idSchema, configSchema),
  })
  .strict()

const entitiesNormalizedSchema = z
  .object({
    resource: z.record(idSchema, resourceSchema),
  })
  .merge(entriesEntitiesNormalizedSchema)
  .strict()

export type NormalizedEntities = z.infer<typeof entitiesNormalizedSchema>
