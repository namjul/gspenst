import { object, number, string, boolean, mixed } from 'yup'
import { isObject, removeNullish } from './utils'
import { queryTypes, resourceTypes } from './constants'
import type {
  QueryType,
  Taxonomies,
  DataForm,
  Split,
  ResourceType,
  QueryOptions,
  Nullish,
} from './types'

export type Permalink = string

export type Template = string | undefined

export type DataQuery = {
  resourceType: Exclude<ResourceType, 'config'>
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
    [key in Exclude<ResourceType, 'config'>]?: DataRouter[]
  }
}

export type RouteConfig = {
  template?: Template
  data?: Data | undefined
}

export type CollectionConfig = {
  permalink: Permalink
  template?: Template
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
      | Template
      | {
          template?: Template
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
        } & QueryOptions
      }
    | undefined
  taxonomies?:
    | {
        [key in Taxonomies]?: Permalink
      }
    | undefined
}

const dataStringSchema = string().matches(
  new RegExp(`(${resourceTypes.join('|')})\\..*`),
  'Incorrect Format. Please use e.g. tag.recipes'
)

const queryOptionsSchema = object({
  filter: string().optional(),
  limit: number().optional(),
  order: string().optional(),
})

const dataObjectSchema = object({
  type: string()
    .matches(
      new RegExp(`^(${queryTypes.join('|')})$`),
      '`type ` has incorrect Format. Use read of browse'
    )
    .required(),
  resourceType: string()
    .matches(
      new RegExp(`^(${resourceTypes.join('|')})$`),
      '`resource` has incorrect Format. Use post, page, author or tag'
    )
    .required(),
  slug: string(),
  redirect: boolean().optional(),
})
  .concat(queryOptionsSchema)
  .noUnknown()

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
  data: dataSchema.optional(), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
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
  data: dataSchema.optional(), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
})
  .concat(queryOptionsSchema)
  .noUnknown()

const taxonomiesSchema = object({
  tag: permalinkSchema,
  author: permalinkSchema,
})
  .noUnknown()
  .nullable()

const routingSchema = object({
  routes: object().nullable(),
  collections: object().nullable(),
  taxonomies: taxonomiesSchema,
}).noUnknown()

function validateDataObject(data: any): asserts data is DataLongForm[''] {
  dataObjectSchema.validateSync(data, { strict: true })
}

function validateRouting(routing: any): asserts routing is {
  routes?: { [s: string]: unknown } | null
  collections?: { [s: string]: unknown } | null
  taxonomies?: { tag?: Permalink; author?: Permalink } | null
} {
  routingSchema.validateSync(routing, { strict: true })
}

function validateRoute(
  route: any
): asserts route is Exclude<RoutingConfigUnresolved['routes'], Nullish>[''] {
  routeSchema.validateSync(route, { strict: true })
}

function transformRoute(
  route: Exclude<RoutingConfigUnresolved['routes'], Nullish>['']
) {
  return removeNullish(
    typeof route === 'string'
      ? { template: route }
      : {
          template: route?.template,
          ...(route?.data ? { data: transformData(route.data) } : {}),
        }
  )
}

function validateCollection(
  collection: any
): asserts collection is Exclude<
  RoutingConfigUnresolved['collections'],
  Nullish
>[''] {
  collectionSchema.validateSync(collection, {
    strict: true,
  })
}

function transformCollection(
  collection: Exclude<RoutingConfigUnresolved['collections'], Nullish>['']
) {
  const { permalink, template, data, filter, order, limit } = collection
  return removeNullish({
    template,
    permalink: transformPermalink(permalink),
    filter,
    order,
    limit,
    data: transformData(data),
  })
}

function validateTaxonomies(
  taxonomies: any
): asserts taxonomies is RoutingConfigUnresolved['taxonomies'] {
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

function transformData(data?: DataShortForm | DataLongForm) {
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
        type: queryTypes[0],
      },
      page: {
        type: queryTypes[0],
      },
      author: {
        type: queryTypes[0],
      },
      tag: {
        type: queryTypes[0],
      },
    } as const

    let queryOptions: DataQuery, routerOptions: DataRouter

    if (isObject(value)) {
      // CASE long form
      validateDataObject(value)

      const { type, resourceType, slug, redirect, filter, limit, order } = value

      queryOptions = {
        ...defaultQueryOptions[resourceType],
        ...removeNullish({
          type,
          resourceType,
          options: {
            slug,
            filter,
            limit,
            order,
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
            filter: undefined,
            limit: undefined,
            order: undefined,
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

export function validate(routingConfig: any = {}) {
  validateRouting(routingConfig)

  const routes =
    routingConfig.routes &&
    Object.entries(routingConfig.routes).reduce<
      RoutingConfigResolved['routes']
    >((acc, [path, properties]) => {
      validateRoute(properties)
      return {
        ...acc,
        [path]: transformRoute(properties),
      }
    }, {})

  const collections =
    routingConfig.collections &&
    Object.entries(routingConfig.collections).reduce<
      RoutingConfigResolved['collections']
    >((acc, [path, properties]) => {
      validateCollection(properties)
      return {
        ...acc,
        [path]: transformCollection(properties),
      }
    }, {})

  validateTaxonomies(routingConfig.taxonomies)

  const taxonomies =
    routingConfig.taxonomies &&
    Object.entries(routingConfig.taxonomies).reduce<
      RoutingConfigResolved['taxonomies']
    >((acc, [path, permalink]) => {
      return {
        ...acc,
        [path]: transformPermalink(permalink),
      }
    }, {})

  return {
    ...(routes && { routes }),
    ...(collections && { collections }),
    ...(taxonomies && { taxonomies }),
  }
}
