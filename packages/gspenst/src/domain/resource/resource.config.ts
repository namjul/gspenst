import { z, type Option } from '../../shared/kernel'
import { parse } from '../../helpers/parser'
import {
  type ThemeConfigNodeFragment,
  GetConfigDocument,
} from '../../.tina/__generated__/types'
import { resourceBaseSchema } from './resource.base'

export const resourceTypeConfig = z.literal('config')

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const isConfigNode = (value: any): value is ThemeConfigNodeFragment =>
  '__typename' in value && value.__typename === 'Config'
/* eslint-enable @typescript-eslint/no-unsafe-member-access */

export const configFragmentSchema = z.custom<ThemeConfigNodeFragment>(
  (value: any) => isConfigNode(value)
)

export const configTinaDataSchema = z
  .preprocess(
    (value) => {
      return {
        data: {
          config: value,
        },
        query: GetConfigDocument,
        variables: {},
      }
    },
    z.object({
      data: z.object({
        config: configFragmentSchema,
      }),
      query: z.string(),
      variables: z.object({}),
    })
  )
  .describe('configTinaDataSchema')

export const configResourceSchema = resourceBaseSchema.merge(
  z.object({
    type: resourceTypeConfig,
    data: configTinaDataSchema,
  })
)

export type ConfigResource = z.infer<typeof configResourceSchema>

export function createConfigResource(
  data: ThemeConfigNodeFragment,
  time: Option<number>
) {
  const configResource = {
    id: data.id,
    path: data._sys.path,
    time,
    data,
    type: data.__typename.toLowerCase(),
    metadata: {},
  }
  return parse(configResourceSchema, configResource)
}
