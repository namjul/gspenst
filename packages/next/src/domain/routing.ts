// https://github.com/ruizb/domain-modeling-ts/blob/master/method-2/implementation-and-types.ts

import { z } from 'zod'
import { ok, err, combine } from 'neverthrow'
import type { Split, Result } from '../types'
import * as Errors from '../errors'

const queryTypeRead = z.literal('read')
const queryTypeBrowse = z.literal('browse')

const resourceTypePost = z.literal('post')
const resourceTypePage = z.literal('page')
const resourceTypeAuthor = z.literal('author')
const resourceTypeTag = z.literal('tag')

const resourceTypeSchema = z.union([
  resourceTypePost,
  resourceTypePage,
  resourceTypeAuthor,
  resourceTypeTag,
])

type ResourceType = z.infer<typeof resourceTypeSchema>

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

const queryFilterOptions = z.object({
  filter: z.string().optional(),
  limit: z.number().optional(),
  order: z.string().optional(),
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

type DataQueryRead = z.infer<typeof dataQueryRead>

const dataQueryBrowse = z
  .object({
    type: queryTypeBrowse,
    resourceType: resourceTypeSchema,
  })
  .merge(queryFilterOptions)
// type DataQueryBrowse = z.infer<typeof dataQueryBrowse>

const dataQuery = z.discriminatedUnion('type', [dataQueryRead, dataQueryBrowse])

export type DataQuery = z.infer<typeof dataQuery>

const template = z.string()

const templateTransform = template.transform((value) => ({
  template: value,
}))

const resourceTypes = [
  resourceTypePost.value,
  resourceTypePage.value,
  resourceTypeAuthor.value,
  resourceTypeTag.value,
]

type DataForm = `${ResourceType}.${string}`

const dataString = z.custom<DataForm>(
  (value) =>
    new RegExp(`(${resourceTypes.join('|')})\\..*`).test(value as string),
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

const dataLongForm = z.record(dataQuery)
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
  })
  .strict()

export type Route = z.infer<typeof route>

const collection = z
  .object({
    permalink,
    data: dataForm.optional(),
    template: template.optional(),
  })
  .merge(queryFilterOptions)

export type Collection = z.infer<typeof collection>

const routingSchema = z
  .object({
    routes: z.record(z.union([templateTransform, route])).optional(),
    collections: z.record(collection).optional(),
    taxonomies: z
      .object({
        tag: permalink.optional(),
        author: permalink.optional(),
      })
      .strict()
      .optional(),
  })
  .strict()

export type RoutingConfigResolved = z.output<typeof routingSchema>

export const parseRouting = (input: unknown) => {
  const result = routingSchema.safeParse(input)

  const resultList: Result<RoutingConfigResolved>[] = []

  if (result.success) {
    resultList.push(ok(result.data))
  } else {
    // TODO use combineWithAllErrors
    result.error.issues.forEach((issue) => {
      const message = `${issue.code} at ${issue.path.join('.')}`
      const help = issue.message
      resultList.push(err(Errors.validation({ message, help })))
    })
  }
  return combine(resultList)
}
