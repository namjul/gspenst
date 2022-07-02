import type { TinaCloudSchema } from 'tinacms'
import type { ThemeContext } from 'gspenst'
import { getHeaders, createRoutingMapping } from 'gspenst'

export type PageProps = Exclude<ThemeContext, { context: 'internal' }> & {} & {
  loading?: boolean
  headers?: ReturnType<typeof getHeaders>
}

export type ClientConfig = {
  tinaSchema: TinaCloudSchema
  routingMapping: ReturnType<typeof createRoutingMapping>
}
