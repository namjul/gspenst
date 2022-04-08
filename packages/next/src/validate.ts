import { ok, err, combine, Ok, Err } from 'neverthrow'
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

type Result<T, E> = Ok<T, E> | Err<never, E>

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

function validateRoute(
  route: any
): Result<Exclude<RoutingConfigUnresolved['routes'], Nullish>[''], Error> {
  try {
    routeSchema.validateSync(route, { strict: true })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data } = route
    if (isObject(data)) {
      Object.values(data).forEach((obj) => {
        if (isDataObject(obj as string | DataLongForm[''])) {
          dataObjectSchema.validateSync(obj, { strict: true })
        }
      })
    }
    return ok(route)
  } catch (e: unknown) {
    return err(new Error(String(e)))
  }
}

function validateCollection(
  collection: any
): Result<Exclude<RoutingConfigUnresolved['collections'], Nullish>[''], Error> {
  try {
    collectionSchema.validateSync(collection, {
      strict: true,
    })
    return ok(collection)
  } catch (e: unknown) {
    return err(new Error(String(e)))
  }
}

function validateTaxonomies(
  taxonomies: any
): Result<RoutingConfigUnresolved['taxonomies'], Error> {
  try {
    taxonomiesSchema.validateSync(taxonomies, {
      strict: true,
    })
    return ok(taxonomies)
  } catch (e: unknown) {
    return err(new Error(String(e)))
  }
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

function transformPermalink(permalink: string) {
  if (permalink.match(/{.*}/)) {
    return permalink.replace(/{(\w+)}/g, ':$1')
  }
  return permalink
}

function isDataObject(
  data?: string | DataLongForm['']
): data is DataLongForm[''] {
  if (isObject(data)) {
    return true
  }
  return false
}

function transformData(data?: DataShortForm | DataLongForm) {
  if (!data) {
    return undefined
  }

  let dataEntries: { [name: string]: string | DataLongForm[''] } = {}

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

    if (isDataObject(value)) {
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

export type ValidationResult = Result<RoutingConfigResolved, Error>

export function validate(routingConfig = {}) {
  const results = []
  const routesResult = []
  const collectionsResult = []
  const taxonomiesResult = []

  const unknownProperty = Object.keys(routingConfig).find(
    (key) => !['routes', 'collections', 'taxonomies'].includes(key)
  )
  if (unknownProperty) {
    results.push(
      err(new Error(`${unknownProperty} is not part of routing config.`))
    )
  }

  const unknownTaxonomiesProperty = Object.keys(
    (routingConfig as { taxonomies?: {} }).taxonomies ?? {}
  ).find((key) => !['tag', 'author'].includes(key))
  if (unknownTaxonomiesProperty) {
    results.push(
      err(
        new Error(
          `${unknownProperty} is not part of taxonomies routing config.`
        )
      )
    )
  }

  const routes: { [path: string]: ReturnType<typeof transformRoute> } = {}
  for (const [path, route] of Object.entries(
    (routingConfig as { routes?: {} }).routes ?? {}
  )) {
    const result = validateRoute(route)
    if (result.isErr()) {
      routesResult.push(result)
    } else {
      routes[path] = transformRoute(result.value)
    }
  }

  const collections: {
    [path: string]: ReturnType<typeof transformCollection>
  } = {}
  for (const [path, collection] of Object.entries(
    (routingConfig as { collections?: {} }).collections ?? {}
  )) {
    const result = validateCollection(collection)
    if (result.isErr()) {
      collectionsResult.push(result)
    } else {
      collections[path] = transformCollection(result.value)
    }
  }

  const taxonomies: { [path: string]: Permalink } = {}
  const result = validateTaxonomies(
    (routingConfig as { taxonomies?: {} }).taxonomies ?? {}
  )
  if (result.isErr()) {
    taxonomiesResult.push(result)
  } else {
    for (const [path, permalink] of Object.entries(result.value ?? {})) {
      taxonomies[path] = transformPermalink(permalink)
    }
  }

  const all = [
    ok({
      routes,
      collections,
      taxonomies,
    }),
    ...results,
    ...routesResult,
    ...collectionsResult,
    ...taxonomiesResult,
  ]
  return combine(all)
}

// TODO should I replace `yup` with `https://github.com/pelotom/runtypes` ?
// pros:
