import { idSchema, z } from '../../shared/kernel'

export const resourceBaseSchema = z.object({
  id: idSchema,
  path: z.string(),
  time: z.number().optional(),
  data: z.any(),
  metadata: z.record(z.any()),
})

resourceBaseSchema.describe('resourceBaseSchema')
