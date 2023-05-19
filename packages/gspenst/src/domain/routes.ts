// import nql from '@tryghost/nql'
import {
  type Split,
  type GspenstResult,
  type Entries,
  type Option,
  z,
  ok,
  err,
  Result,
} from '../shared/kernel'
import * as Errors from '../errors'
import { isString /*, isObject*/ } from '../shared/utils'
import { parse } from '../helpers/parser'
import {
  type LocatorResourceType,
  locatorResourceTypeSchema,
  dynamicVariablesSchema,
  resourceTypes,
} from './resource/resource.locator'

const POST_PER_PAGE = 5

const queryTypeRead = z.literal('read')
const queryTypeBrowse = z.literal('browse')

const permalinkSchema = z
  .string()
  .refine((value) => !/\/:\w+/.test(value), {
    message: 'Please use the following notation e.g. /{slug}/.',
  })
  .transform((value) => {
    if (value.match(/{.*}/)) {
      return value.replace(/{(\w+)}/g, ':$1')
    }
    return value
  })

const orderSchema = z.preprocess(
  (value) => {
    return String(value)
      .split(',')
      .map((singleOrder) => {
        const [field, order] = singleOrder.trim().split(' ')
        return {
          field,
          order,
        }
      })
  },
  z.array(
    z.object({
      field: z.string(),
      order: z.union([z.literal('asc'), z.literal('desc')]),
    })
  )
)

// const filterSchema = z.preprocess((input) => {
//   return {
//     input,
//     parsed: nql(String(input)).parse()
//   }
// }, z.object({
//     input: z.string(),
//     parsed: z.custom(isObject)
//   }))

export const limitSchema = z
  .union([z.number(), z.literal('all')])
  .default(POST_PER_PAGE)

export const queryFilterOptions = z.object({
  filter: z.string().optional(),
  limit: limitSchema,
  order: orderSchema.optional(),
  // include: z.string().optional(),
  // visibility: z.string().optional(),
  // status: z.string().optional(),
  // page: z.string().optional(),
})

export type QueryFilterOptions = z.infer<typeof queryFilterOptions>

const dataQueryRead = z
  .object({
    type: queryTypeRead,
    resourceType: locatorResourceTypeSchema,
    redirect: z.boolean().optional(),
  })
  .merge(dynamicVariablesSchema.partial())
  .strict()

export type DataQueryRead = z.infer<typeof dataQueryRead>

const dataQueryBrowse = z
  .object({
    type: queryTypeBrowse,
    resourceType: locatorResourceTypeSchema,
    page: z.number().nullish(), // TODO make non optional
  })
  .merge(queryFilterOptions)
  .strict()
export type DataQueryBrowse = z.infer<typeof dataQueryBrowse>

export const dataQuery = z.discriminatedUnion('type', [
  dataQueryRead,
  dataQueryBrowse,
])

export type DataQuery = z.infer<typeof dataQuery>

const template = z.string()

type DataForm = `${z.infer<typeof locatorResourceTypeSchema>}.${string}`

const dataString = z
  .string()
  .refine(
    (value) => new RegExp(`(${resourceTypes.join('|')})\\..*`).test(value),
    {
      message: 'Incorrect Format. Please use e.g. tag.recipes',
    }
  )

const dataStringTransform = dataString.transform((value) => {
  const [_resourceType] = value.split('.') as Split<DataForm, '.'>
  return { [_resourceType as string]: value } as Record<string, DataForm>
})

const dataShortForm = z
  .union([dataStringTransform, z.record(dataString)])
  .transform((dataValues) => {
    return Object.fromEntries(
      Object.entries(dataValues).map(([key, value]) => {
        const [_resourceType, _slug] = value.split('.') as Split<DataForm, '.'>
        return [
          key,
          {
            type: 'read',
            resourceType: _resourceType,
            slug: _slug,
            redirect: true,
          },
        ] as [string, DataQuery]
      })
    )
  })

export type DataShortForm = z.output<typeof dataShortForm>

const dataLongForm = z.record(dataQuery)
export type DataLongForm = z.output<typeof dataLongForm>

const dataForm = z
  .union([dataShortForm, dataLongForm])
  .transform((dataValues) => {
    const router = Object.entries(dataValues)
      .filter(
        (dataValue): dataValue is [string, DataQueryRead] =>
          dataValue[1].type === 'read'
      )
      .reduce<{
        [key in LocatorResourceType]?: {
          redirect: boolean
          slug: Option<string>
        }[]
      }>((acc, [_, { resourceType, slug, redirect }]) => {
        if (!acc[resourceType]) {
          acc[resourceType] = []
        }

        acc[resourceType]?.push({ redirect: redirect ?? true, slug })
        return acc
      }, {})
    return {
      query: dataValues,
      router,
    }
  })

export type Data = z.output<typeof dataForm>

const route = z
  .object({
    template: template.optional(),
    data: dataForm.optional(),
    controller: z.literal('channel').optional(),
  })
  .merge(queryFilterOptions)
  .strict()
  .refine(
    (value) => {
      if ('controller' in value) {
        return 'filter' in value
      }
      return true
    },
    () => ({ message: 'filter property required when using channel' })
  )

export type Route = z.infer<typeof route>

const collection = z
  .object({
    permalink: permalinkSchema,
    data: dataForm.optional(),
    template: template.optional(),
  })
  .merge(queryFilterOptions)

export type Collection = z.infer<typeof collection>

const tagFilterSchema = z.literal("tags:'%s'")
const tagSchema = z.object({
  permalink: permalinkSchema,
  limit: limitSchema,
  filter: tagFilterSchema,
})
const authorFilterSchema = z.literal("authors:'%s'")
const authorSchema = z.object({
  permalink: permalinkSchema,
  limit: limitSchema,
  filter: authorFilterSchema,
})

const taxonomySchema = z.union([tagSchema, authorSchema])

export type Taxonomy = z.infer<typeof taxonomySchema>

// TODO allow only strings
const taxonomies = z
  .object({
    tag: z.preprocess((value) => {
      return {
        permalink: value,
        filter: tagFilterSchema.value,
      }
    }, tagSchema),
    author: z.preprocess((value) => {
      return {
        permalink: value,
        filter: authorFilterSchema.value,
      }
    }, authorSchema),
  })
  .strict()

export const routesSchema = z
  .object({
    routes: z
      .record(
        z.preprocess(
          (value) =>
            isString(value)
              ? {
                  template: value,
                }
              : value,
          route
        )
      )
      .nullable()
      .optional(),
    collections: z.record(collection).nullable().optional(),
    taxonomies: taxonomies.nullable().optional(),
  })
  .strict()
  .default({
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
  })

routesSchema.describe('routesSchema')

export type RoutesConfigInput = z.input<typeof routesSchema> | unknown
export type RoutesConfig = z.output<typeof routesSchema>

export function parseRoutes(input: unknown) {
  const result = parse(routesSchema, input)

  const resultList: GspenstResult<RoutesConfig>[] = []

  const processIssue = (issue: z.ZodIssue): z.ZodIssue[] => {
    if (issue.code === z.ZodIssueCode.invalid_union) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return issue.unionErrors.flatMap(processError)
    }
    return [issue]
  }

  const processError = (error: z.ZodError): z.ZodIssue[] => {
    return error.issues.flatMap<z.ZodIssue>(processIssue)
  }

  if (result.isOk()) {
    resultList.push(ok(result.value))
  } else if (result.error.type === 'Parse') {
    processError(result.error.error as z.ZodError).forEach((issue) => {
      const message = `${issue.code} at ${issue.path.join('/')}`
      const help = issue.message

      resultList.push(err(Errors.validation({ message, help })))
    })
  }
  return Result.combineWithAllErrors(resultList)
}

export function getRoutes(routesConfig: RoutesConfig) {
  return Object.entries(routesConfig.routes ?? {}) as Entries<
    typeof routesConfig.routes
  >
}

export function getCollections(routesConfig: RoutesConfig) {
  return Object.entries(routesConfig.collections ?? {}) as Entries<
    typeof routesConfig.collections
  >
}

export function getTaxonomies(routesConfig: RoutesConfig) {
  return Object.entries(routesConfig.taxonomies ?? {}) as Entries<
    typeof routesConfig.taxonomies
  >
}
