import { object, string, boolean, mixed } from 'yup'
import { isObject, removeNullish } from './utils'
import type {
  QueryType,
  Taxonomies,
  DataForm,
  Split,
  ResourceType,
  QueryOptions,
} from './types'

export type Permalink = string

export type DataQuery = {
  resourceType: ResourceType
  type: QueryType
  options: QueryOptions
}

export type DataRouter = {
  redirect: boolean
  slug: string
}

export type Data = {
  query: {
    [key: string]: DataQuery
  }
  router: {
    [key in ResourceType]?: DataRouter[]
  }
}

export type RouteConfig = {
  template?: string | undefined
  data?: Data | undefined
}

export type CollectionConfig = {
  permalink: Permalink
  template?: string | undefined
  data?: Data | undefined
}

export type RoutingConfigResolved = {
  routes?:
    | {
        [path: string]: RouteConfig
      }
    | undefined
  collections?:
    | {
        [path: string]: CollectionConfig
      }
    | undefined
  taxonomies?:
    | {
        [key in Taxonomies]?: Permalink
      }
    | undefined
}

type DataShortForm = string | { [name: string]: string }
type DataLongForm = {
  [name: string]: Omit<DataQuery, 'options'> & QueryOptions & DataRouter
}

export type RoutingConfigUnresolved = {
  routes?: {
    [path: string]:
      | {
          template?: string
          data?: DataShortForm | DataLongForm
        }
      | undefined
  }
  collections?:
    | {
        [path: string]: {
          permalink: Permalink
          template?: string | undefined
          data?: DataShortForm | DataLongForm
        }
      }
    | undefined
  taxonomies?:
    | {
        [key in Taxonomies]?: Permalink
      }
    | undefined
}

export const defaultRoutingConfig = {
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

const dataObjectSchema = object({
  type: string()
    .matches(
      /^(read|browse)$/,
      '`type ` has incorrect Format. Use read of brwose'
    )
    .required(),
  resourceType: string()
    .matches(
      /^(page|post|tag|author)$/,
      '`resource` has incorrect Format. Use post, page, author or tag'
    )
    .required(),
  slug: string(),
  filter: string().optional(),
  limit: string().optional(),
  order: string().optional(),
  redirect: boolean().optional(),
}).noUnknown()

const dataSchema = mixed().when({
  is: (value: any) => typeof value === 'string',
  then: () => dataStringSchema,
  otherwise: (schema) =>
    schema.test(
      'is-object',
      ({ value }) =>
        `data must be a \`object\` type or \`string\`, but the final value was: \`${value}\`.`,
      (value) => {
        return value ? isObject(value) : true
      }
    ),
})

const routesObjectSchema = object({
  template: string(),
  data: dataSchema.optional(),
}).noUnknown()

const permalinkSchema = string().test(
  'is-permalink',
  'Please use the following notation e.g. /{slug}/.',
  (value) => (typeof value === 'string' ? !/\/:\w+/.test(value) : true)
)

const routeSchema = mixed().when({
  is: (value: any) => typeof value === 'string',
  then: () => string().required(),
  otherwise: () => routesObjectSchema.required(),
})

const collectionSchema = object({
  permalink: permalinkSchema.required(),
  template: string().optional(),
  data: dataSchema.optional(),
}).noUnknown()

const taxonomiesSchema = object({
  tag: permalinkSchema,
  author: permalinkSchema,
}).noUnknown()

const routingSchema = object({
  routes: object().nullable(),
  collections: object().nullable(),
  taxonomies: taxonomiesSchema,
}).noUnknown()

function validateDataObject(data: any): asserts data is DataLongForm[''] {
  dataObjectSchema.validateSync(data, { strict: true })
}

function validateRouting(routing: any): asserts routing is {
  routes?: {} | null
  collections?: {} | null
  taxonomies?: {} | null
} {
  routingSchema.validateSync(routing, { strict: true })
}

function validateRoute(
  route: any
): asserts route is string | { template: string; data: string } {
  routeSchema.validateSync(route, { strict: true })
}

function validateCollection(collection: any): asserts collection is {
  permalink: string
  template?: string
  data?: string
} {
  collectionSchema.validateSync(collection, {
    strict: true,
  })
}

function validateTaxonomies(taxonomies: any): asserts taxonomies is {
  tag: string
  author: string
} {
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

  let dataEntries: { [name: string]: string | object } = {}

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
    const defaultRouterOptions = {
      redirect: true,
    }
    const defaultQueryOptions = {
      post: {
        type: 'read',
      },
      page: {
        type: 'read',
      },
      author: {
        type: 'read',
      },
      tag: {
        type: 'read',
      },
    } as const

    let queryOptions: DataQuery, routerOptions: DataRouter

    if (isObject(value)) {
      // CASE long form
      validateDataObject(value)

      const { type, resourceType, slug, redirect } = value

      queryOptions = {
        ...defaultQueryOptions[resourceType],
        ...removeNullish({
          type,
          resourceType,
          options: {
            slug,
          },
        }),
      }

      routerOptions = {
        ...defaultRouterOptions,
        ...removeNullish({
          redirect,
          slug,
        }),
      }
    } else {
      // CASE short form
      const [resourceType, slug] = value.split('.') as Split<DataForm, '.'>

      queryOptions = {
        ...defaultQueryOptions[resourceType],
        ...removeNullish({
          resourceType,
          options: {
            slug,
          },
        }),
      }

      routerOptions = {
        ...defaultRouterOptions,
        ...removeNullish({
          slug,
        }),
      }
    }
    query[key] = queryOptions
    const { resourceType } = queryOptions
    if (!router[resourceType]) {
      router[resourceType] = []
    }
    router[resourceType]?.push(routerOptions)
  }, {})

  return {
    query,
    router,
  }
}

function transformRoute(route: string | { template: string; data: string }) {
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

  const routes = Object.entries(routingConfig.routes ?? {}).reduce<
    RoutingConfigResolved['routes']
  >((acc, [path, properties]) => {
    validateRoute(properties)
    return {
      ...acc,
      [path]: transformRoute(properties),
    }
  }, {})

  const collections = Object.entries(routingConfig.collections ?? {}).reduce<
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
