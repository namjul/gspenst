import { idSchema, jsonSchema, z } from '../shared/kernel'
import { parse } from '../helpers/parser'
import type { Result } from '../shared/kernel'
import type { ConfigResource } from './resource'

export const configSchema = z
  .object({
    type: z.literal('config'),
    id: idSchema,
    values: jsonSchema,
  })
  .strict()

configSchema.describe('configSchema')

export type Config = z.infer<typeof configSchema>

export function createConfig(configResource: ConfigResource): Result<Config> {
  const {
    tinaData: {
      data: { config },
    },
  } = configResource

  return parse(configSchema, {
    type: 'config',
    id: config.id,
    values: config._values, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  })
}
