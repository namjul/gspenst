import type { Simplify } from '../shared-kernel'
import type { ResourceType, DynamicVariables } from './resource'
import type { DataQuery, QueryFilterOptions } from './routes'

export type Redirect =
  | {
      destination: string
      statusCode: 301 | 302 | 303 | 307 | 308
      basePath?: false
    }
  | {
      destination: string
      permanent: boolean
      basePath?: false
    }

export type Request = {
  path: string
  params?:
    | Simplify<Partial<DynamicVariables & { page: number | undefined }>>
    | undefined
}

export type RoutingContext =
  | ({
      type: 'collection'
      name: string
      data:
        | {
            [key: string]: DataQuery
          }
        | undefined
      templates: string[]
      request: Request
    } & QueryFilterOptions)
  | ({
      type: 'channel'
      name: string
      data:
        | {
            [key: string]: DataQuery
          }
        | undefined
      templates: string[]
      request: Request
    } & QueryFilterOptions)
  | {
      type: 'entry'
      resourceType: ResourceType
      templates: string[]
      request: Request
    }
  | {
      type: 'custom'
      data:
        | {
            [key: string]: DataQuery
          }
        | undefined
      templates: string[]
      request: Request
    }
  | ({ type: 'redirect' } & Redirect)
  | { type: 'internal' }
