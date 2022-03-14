import { object, string, mixed } from 'yup'
import type { LiteralUnion } from '@gspenst/utils'
import type { Routing, DataForm } from '../types'

const dataStringSchema = string().matches(
  /.*\..*/,
  'Incorrect Format. Please use e.g. tag.recipes'
)

const dataSchema = mixed().when({
  is: (value: any) => typeof value === 'string',
  then: () => dataStringSchema,
  otherwise: () => object(),
})

const routesObjectSchema = object({
  template: string(),
  data: dataSchema,
}).noUnknown()

const routesSchema = mixed().when({
  is: (value: any) => typeof value === 'string',
  then: () => string().required(),
  otherwise: () => routesObjectSchema,
})

const collectionsSchema = object({
  permalink: string().required(),
  template: string().optional(),
  data: dataSchema,
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

type DataQuery = {
  resource: LiteralUnion<'page' | 'post' | 'author' | 'tag', string>
  type: 'read' | 'browse'
  options: {
    slug: string
    filter?: string
    limit?: number | 'all'
    order?: string // '{property} ASC|DSC'
  }
}

type DataRouter = {
  redirect: boolean
  slug?: string
}

type DataReturnType = {
  query: {
    [name: string]: DataQuery
  }
  router: {
    [name: string]: DataRouter[]
  }
}

export type ReturnType = {
  routes: {
    [path: string]: {
      template: string
      data?: DataReturnType
    }
  }
  collections: {
    [path: string]: {
      permalink: string
      template?: string
      data?: DataReturnType
    }
  }
  taxonomies: {
    tag?: 'string'
    author?: 'string'
  }
}

function validateRouting(routing: any): asserts routing is Routing {
  routingSchema.validateSync(routing, { strict: true })
  return routing
}

type Route = Exclude<Routing['routes'], undefined>['']

function validateRoutes(route: any): asserts route is Route {
  routesSchema.validateSync(route, { strict: true })
  return route
}

type Collection = Exclude<Routing['collections'], undefined>['']

function validateCollections(
  collection: any
): asserts collection is Collection {
  collectionsSchema.validateSync(collection, { strict: true })
  return collection
}

function validateTaxonomies(
  taxonomies: any
): asserts taxonomies is Routing['taxonomies'] {
  taxonomiesSchema.validateSync(taxonomies, { strict: true })
  return taxonomies
}

function transformData(data?: DataForm) {
  if (!data) {
    return undefined
  }

  let dataEntries: Exclude<DataForm, string> = {}

  if (typeof data === 'string') {
    const [resource] = data.split('.')
    if (resource) {
      dataEntries[resource] = data
    }
  } else {
    dataEntries = data
  }

  const router: DataReturnType['router'] = {}
  const query: DataReturnType['query'] = {}

  Object.entries(dataEntries).forEach(([key, value]) => {
    const [resource, slug] = value.split('.')
    if (!resource || !slug) {
      throw new Error('Data field is incomplete')
    }
    query[key] = {
      resource,
      type: slug ? 'read' : 'browse',
      options: { slug },
    }
    if (!router[resource]) {
      router[resource] = []
    }
    router[resource]?.push({
      redirect: true,
      slug,
    })
  }, {})

  return {
    query,
    router,
  }
}

function transformRoute(route: Route) {
  const { template, data } =
    typeof route === 'string' ? { template: route, data: undefined } : route

  return {
    template,
    data: transformData(data),
  }
}

export function validate(routingConfig: any = {}): ReturnType {
  validateRouting(routingConfig)

  const result: ReturnType = {
    routes: {},
    collections: {},
    taxonomies: {},
  }

  Object.entries(routingConfig.routes ?? {}).forEach(([path, properties]) => {
    validateRoutes(properties)
    const route = transformRoute(properties)
    result.routes[path] = route
  })

  Object.entries(routingConfig.collections ?? {}).forEach(
    ([path, properties]) => {
      validateCollections(properties)
      const { permalink, template, data } = properties
      result.collections[path] = {
        template,
        permalink,
        data: transformData(data),
      }
    }
  )

  validateTaxonomies(routingConfig.taxonomies)

  return result
}
