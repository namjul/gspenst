import { z, ok, err, combineWithAllErrors } from '../shared-kernel'
import type { Split, Result } from '../shared-kernel'
import * as Errors from '../errors'
import { resourceTypeSchema, resourceTypes } from './resource'
import type { ResourceType } from './resource'

const queryTypeRead = z.literal('read')
const queryTypeBrowse = z.literal('browse')

const slugSchema = z.string()

const permalink = z
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

const orderShema = z.preprocess(
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

const queryFilterOptions = z.object({
  filter: z.string().optional(),
  limit: z.union([z.number(), z.literal('all')]).optional(),
  order: orderShema.optional(),
  // include: z.string().optional(),
  // visibility: z.string().optional(),
  // status: z.string().optional(),
  // page: z.string().optional(),
})

export type QueryFilterOptions = z.infer<typeof queryFilterOptions>

const dataQueryRead = z
  .object({
    type: queryTypeRead,
    resourceType: resourceTypeSchema,
    slug: slugSchema,
    redirect: z.boolean().optional(),
  })
  .strict()

export type DataQueryRead = z.infer<typeof dataQueryRead>

const dataQueryBrowse = z
  .object({
    type: queryTypeBrowse,
    resourceType: resourceTypeSchema,
    page: z.number().optional(), // TODO make non optional
  })
  .merge(queryFilterOptions)
  .strict()
export type DataQueryBrowse = z.infer<typeof dataQueryBrowse>

const dataQuery = z.discriminatedUnion('type', [dataQueryRead, dataQueryBrowse])

export type DataQuery = z.infer<typeof dataQuery>

const template = z.string()

const templateTransform = template.transform((value) => ({
  template: value,
}))

type DataForm = `${ResourceType}.${string}`

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
        [key in ResourceType]?: { redirect: boolean; slug: string }[]
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
    permalink,
    data: dataForm.optional(),
    template: template.optional(),
  })
  .merge(queryFilterOptions)

export type Collection = z.infer<typeof collection>

const taxonomies = z
  .object({
    tag: permalink.optional(),
    author: permalink.optional(),
  })
  .strict()

const routingSchema = z
  .object({
    routes: z.record(z.union([templateTransform, route])).optional(),
    collections: z.record(collection).optional(),
    taxonomies: taxonomies.optional(),
  })
  .strict()

export type RoutingConfigResolved = z.output<typeof routingSchema>

export const parseRoutes = (input: unknown) => {
  const result = routingSchema.safeParse(input)

  const resultList: Result<RoutingConfigResolved>[] = []

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

  if (result.success) {
    resultList.push(ok(result.data))
  } else {
    processError(result.error).forEach((issue) => {
      const message = `${issue.code} at ${issue.path.join('/')}`
      const help = issue.message

      resultList.push(err(Errors.validation({ message, help })))
    })
  }
  return combineWithAllErrors(resultList)
}
