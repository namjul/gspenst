import { idSchema, jsonSchema, z } from '../shared/kernel'
import { parse } from '../helpers/parser'
import type { Result } from '../shared/kernel'
import type { ThemeConfigNodeFragment as ConfigResourceNode } from '../../.tina/__generated__/types'

export const configSchema = z
  .object({
    type: z.literal('config'),
    id: idSchema,
    values: jsonSchema,
  })
  .strict()

configSchema.describe('configSchema')

export type Config = z.infer<typeof configSchema>

export function createConfig(node: ConfigResourceNode): Result<Config> {
  return parse(configSchema, {
    type: 'config',
    id: node.id,
    values: node._values, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  })
}
