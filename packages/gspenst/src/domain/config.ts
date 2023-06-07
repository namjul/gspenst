import {
  type GspenstResult,
  type Json,
  idSchema,
  jsonSchema,
  z,
} from '../shared/kernel'
import { parse } from '../helpers/parser'
import { type ThemeConfigNodeFragment } from '../.tina/__generated__/types'

export const configSchema = z
  .object({
    type: z.literal('config'),
    id: idSchema,
    values: jsonSchema,
  })
  .strict()
  .describe('configSchema')

export type Config = z.infer<typeof configSchema>
export type ConfigResourceNode = ThemeConfigNodeFragment & { values?: Json }

export function createConfig(node: ConfigResourceNode): GspenstResult<Config> {
  return parse(configSchema, {
    type: 'config',
    id: node.id,
    values: node.values ?? node._values, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  })
}
