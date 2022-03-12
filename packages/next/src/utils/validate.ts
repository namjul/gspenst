import { object, string, mixed, InferType } from 'yup'
import { isObject } from '@gspenst/utils'

const routesObjectSchema = object({
  template: string().optional(),
  data: string().optional(),
}).noUnknown()

const routesSchema = mixed()
  .when({
    is: (value: any) => typeof value === 'string',
    then: string(),
  })
  .when({
    is: (value: any) => isObject(value),
    then: routesObjectSchema,
  })

const collectionsSchema = object({
  permalink: string().required(),
  template: string().optional(),
  data: string().optional(),
}).noUnknown()

const taxonomiesSchema = object({
  tag: string().optional(),
  author: string().optional(),
}).noUnknown()

const routingSchema = object({
  routes: object(),
  collections: object(),
  taxonomies: object(),
}).noUnknown()

type RoutesProperties = InferType<typeof routesObjectSchema>
type CollectionsProperties = InferType<typeof collectionsSchema>
type TaxonomiesProperties = InferType<typeof taxonomiesSchema>

export type ReturnType = {
  routes: {
    [path: string]: string | RoutesProperties
  }
  collections: {
    [path: string]: CollectionsProperties
  }
  taxonomies: TaxonomiesProperties
}

export function validate(routingConfig?: Record<string, any>) {
  routingSchema.validateSync(routingConfig, { strict: true })

  const result: ReturnType = {
    routes: {},
    collections: {},
    taxonomies: {
      tag: undefined,
      author: undefined,
    },
    ...routingConfig,
  }

  Object.entries(result.routes).forEach(([path, properties]) => {
    routesSchema.validateSync(properties, { strict: true })
    const props =
      typeof properties === 'string'
        ? { template: properties, data: undefined }
        : properties
    result.routes[path] = props
  })

  Object.entries(result.collections).forEach(([path, properties]) => {
    collectionsSchema.validateSync(properties, { strict: true })
    result.collections[path] = properties
  })

  taxonomiesSchema.validateSync(result.taxonomies, { strict: true })

  return result
}
