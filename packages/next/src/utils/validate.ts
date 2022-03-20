import { object, string, mixed } from 'yup'
import type { LiteralUnion, Split } from '@gspenst/utils'
import type { DataForm, Resource } from '../types'

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

export type Data = {
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
      data?: Data
    }
  }
  collections: {
    [path: string]: {
      permalink: string
      template?: string
      data?: Data
    }
  }
  taxonomies: {
    tag?: string
    author?: string
  }
}

const defaultRoutingConfig = {
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

const permalinkSchema = string().test(
  'is-permalink',
  'Please use the following notation e.g. /{slug}/.',
  (value) => (typeof value === 'string' ? !/\/:\w+/.test(value) : true)
)

const routeSchema = mixed().when({
  is: (value: any) => typeof value === 'string',
  then: () => string().required(),
  otherwise: () => routesObjectSchema,
})

const collectionSchema = object({
  permalink: permalinkSchema.required(),
  template: string().optional(),
  data: dataStringSchema,
}).noUnknown()

const taxonomiesSchema = object({
  tag: permalinkSchema.required(),
  author: permalinkSchema.required(),
}).noUnknown()

const routingSchema = object({
  routes: object(),
  collections: object(),
  taxonomies: taxonomiesSchema,
}).noUnknown()

type RoutingConfig = {
  routes: {
    [path: string]: string | { template: string; data: string }
  }
  collections: {
    [path: string]: {
      permalink: string
      template?: string
      data?: string
    }
  }
  taxonomies: {
    tag: string
    author: string
  }
}

function validateRouting(
  routing: any
): asserts routing is { routes?: {}; collections?: {}; taxonomies?: {} } {
  routingSchema.validateSync(routing, { strict: true })
}

function validateRoute(
  route: any
): asserts route is RoutingConfig['routes'][''] {
  routeSchema.validateSync(route, { strict: true })
}

function validateCollection(
  collection: any
): asserts collection is RoutingConfig['collections'][''] {
  collectionSchema.validateSync(collection, {
    strict: true,
  })
}

function validateTaxonomies(
  taxonomies: any
): asserts taxonomies is RoutingConfig['taxonomies'] {
  taxonomiesSchema.validateSync(taxonomies, {
    strict: true,
  })
}

function transformPermalink(permalink: string) {
  if (permalink.match(/{.*}/)) {
    return permalink.replace(/{(\w+)}/g, ':$1')
  }
  return permalink
}

function transformData(data?: string) {
  if (!data) {
    return undefined
  }

  let dataEntries: { [name: string]: string } = {}

  if (typeof data === 'string') {
    const [resource] = data.split('.')
    if (resource) {
      dataEntries[resource] = data
    }
  } else {
    dataEntries = data
  }

  const router: Data['router'] = {}
  const query: Data['query'] = {}

  Object.entries(dataEntries).forEach(([key, value]) => {
    const [resource, slug] = value.split('.') as Split<DataForm, '.'>
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

function transformRoute(route: RoutingConfig['routes']['']) {
  return typeof route === 'string'
    ? { template: route }
    : {
        template: route.template,
        ...(route.data ? { data: transformData(route.data) } : {}),
      }
}

export function validate(_routingConfig: any = {}) {
  validateRouting(_routingConfig)

  const routingConfig = {
    ...defaultRoutingConfig,
    ..._routingConfig,
  }

  const routes = Object.entries(routingConfig.routes).reduce<
    RoutingConfigResolved['routes']
  >((acc, [path, properties]) => {
    validateRoute(properties)
    return {
      ...acc,
      [path]: transformRoute(properties),
    }
  }, {})

  const collections = Object.entries(routingConfig.collections).reduce<
    RoutingConfigResolved['collections']
  >((acc, [path, properties]) => {
    validateCollection(properties)
    const { permalink, template, data } = properties
    return {
      ...acc,
      [path]: {
        template,
        permalink: transformPermalink(permalink),
        data: transformData(data),
      },
    }
  }, {})

  validateTaxonomies(routingConfig.taxonomies)
  const taxonomies = Object.entries(routingConfig.taxonomies).reduce<
    RoutingConfigResolved['taxonomies']
  >((acc, [path, permalink]) => {
    return {
      ...acc,
      [path]: transformPermalink(permalink),
    }
  }, {})

  return {
    routes,
    collections,
    taxonomies,
  }
}
