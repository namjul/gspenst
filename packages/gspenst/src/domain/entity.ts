import { z, idSchema } from '../shared/kernel'
import { configSchema } from './config'
import { postNormalizedSchema } from './post'
import { pageNormalizedSchema } from './page'
import { authorSchema } from './author'
import { tagSchema } from './tag'

export const entitiesNormalizedSchema = z
  .object({
    post: z.record(idSchema, postNormalizedSchema),
    page: z.record(idSchema, pageNormalizedSchema),
    author: z.record(idSchema, authorSchema),
    tag: z.record(idSchema, tagSchema),
    config: z.record(idSchema, configSchema),
  })
  .strict()

export type NormalizedEntities = z.infer<typeof entitiesNormalizedSchema>
