import { object, string, mixed } from 'yup'
// import type { InferType, ObjectSchema } from 'yup';
import type { LiteralUnion, Split } from '@gspenst/utils'
import type { RoutingConfig, DataForm, Resource } from '../types'

function splitDataString(data: DataForm) {
  const [resource, slug] = data.split('.') as Split<DataForm, '.'>

  return {
    resource,
    slug,
  }
}

const defaultRoutes = {
  routes: {},
  collections: {
    '/': {
      permalink: '/{slug}/',
      template: 'index',
    },
  },
  taxonomies: {
    tag: '/tag/{slug}',
    author: '/author/{slug}',
  },
}

const dataStringSchema = string().matches(
  /(page|post|tag|author)\..*/,
  'Incorrect Format. Please use e.g. tag.recipes'
)

const routesObjectSchema = object({
  template: string(),
  data: dataStringSchema,
}).noUnknown()

const routesSchema = mixed().when({
  is: (value: any) => typeof value === 'string',
  then: () => string().required(),
  otherwise: () => routesObjectSchema,
})

const permalinkSchema = string()
  .transform((_permalink: string, permalink: string) => {
    if (permalink.match(/{.*}/)) {
      return permalink.replace(/{(\w+)}/g, ':$1')
    }
    return permalink
  })
  .test(
    'is-permalink',
    'Please use the following notation e.g. /{slug}/.',
    (value) => (typeof value === 'string' ? !/\/:\w+/.test(value) : true)
  )

const collectionsSchema = object({
  permalink: permalinkSchema,
  template: string().optional(),
  data: dataStringSchema,
}).noUnknown()

const taxonomiesSchema = object({
  tag: permalinkSchema,
  author: permalinkSchema,
})
  .default(defaultRoutes.taxonomies)
  .noUnknown()

const routingSchema = object({
  routes: object().default(defaultRoutes.routes),
  collections: object().default(defaultRoutes.collections),
  taxonomies: taxonomiesSchema,
}).noUnknown()

type DataQuery = {
  resource: Resource
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
  slug: string
}

export type DataReturnType = {
  query: {
    [key in LiteralUnion<Resource, string>]?: DataQuery
  }
  router: {
    [key in Resource]?: DataRouter[]
  }
}

export type RoutingConfigResolved = {
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
    tag?: string
    author?: string
  }
}

function validateRouting(routing: any) {
  routingSchema.validateSync(routing, { strict: true })
  return routingSchema.cast(routing) as RoutingConfigResolved
}

type RouteConfig = Exclude<RoutingConfig['routes'], undefined>['']

function validateRoutes(route: any) {
  routesSchema.validateSync(route, { strict: true })
  return routesSchema.cast(route) as RouteConfig
}

type CollectionConfig = Exclude<RoutingConfig['collections'], undefined>['']

function validateCollections(collection: any) {
  collectionsSchema.validateSync(collection, {
    strict: true,
  })
  return collectionsSchema.cast(collection) as CollectionConfig
}

function transformData(data?: DataForm) {
  if (!data) {
    return undefined
  }

  let dataEntries: { [name: string]: DataForm } = {}

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
    const { resource, slug } = splitDataString(value)
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

function transformRoute(route: RouteConfig) {
  const { template, data } =
    typeof route === 'string' ? { template: route, data: undefined } : route

  return {
    template,
    data: transformData(data),
  }
}

export function validate(_routingConfig: any = {}): RoutingConfigResolved {
  let { routes, collections, taxonomies } = validateRouting(_routingConfig) // eslint-disable-line prefer-const

  routes = Object.entries(routes).reduce<RoutingConfigResolved['routes']>(
    (acc, [path, properties]) => {
      return {
        ...acc,
        [path]: transformRoute(validateRoutes(properties)),
      }
    },
    {}
  )

  collections = Object.entries(collections).reduce<
    RoutingConfigResolved['collections']
  >((acc, [path, properties]) => {
    const { permalink, template, data } = validateCollections(properties)
    return {
      ...acc,
      [path]: {
        template,
        permalink,
        data: transformData(data),
      },
    }
  }, {})

  return {
    routes,
    collections,
    taxonomies,
  }
}
