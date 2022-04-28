import type { RoutingContextType } from '../types'
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
      type: Extract<RoutingContextType, 'collection'>
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
      type: Extract<RoutingContextType, 'channel'>
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
      type: Extract<RoutingContextType, 'entry'>
      resourceType: ResourceType
      templates: string[]
      request: Request
    }
  | {
      type: Extract<RoutingContextType, 'custom'>
      data:
        | {
            [key: string]: DataQuery
          }
        | undefined
      templates: string[]
      request: Request
    }
  | ({ type: Extract<RoutingContextType, 'redirect'> } & Redirect)
  | { type: Extract<RoutingContextType, 'internal'> }
