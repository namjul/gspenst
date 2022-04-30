import { z } from '../shared-kernel'
import { dynamicVariablesSchema, resourceTypeSchema } from './resource'
import { queryFilterOptions, dataQuery } from './routes'

const redirectSchema = z.object({
  destination: z.string(),
  permanent: z.boolean(),
})

export type Redirect = z.infer<typeof redirectSchema>

const requestSchema = z.object({
  path: z.string(),
  params: dynamicVariablesSchema
    .merge(z.object({ page: z.number().optional() }))
    .partial()
    .optional(),
})

export type Request = z.infer<typeof requestSchema>

const collectionRoutingContextSchema = z
  .object({
    type: z.literal('collection'),
    name: z.string(),
    data: z.record(dataQuery).optional(),
    templates: z.array(z.string()),
    request: requestSchema,
  })
  .merge(queryFilterOptions)

export type CollectionRoutingContext = z.infer<
  typeof collectionRoutingContextSchema
>

const channelRoutingContextSchema = z
  .object({
    type: z.literal('channel'),
    name: z.string(),
    data: z.record(dataQuery).optional(),
    templates: z.array(z.string()),
    request: requestSchema,
  })
  .merge(queryFilterOptions)

export type ChannelRoutingContext = z.infer<typeof channelRoutingContextSchema>

const entryRoutingContextSchema = z.object({
  type: z.literal('entry'),
  resourceType: resourceTypeSchema,
  templates: z.array(z.string()),
  request: requestSchema,
})

export type EntryRoutingContext = z.infer<typeof entryRoutingContextSchema>

const customRoutingContextSchema = z.object({
  type: z.literal('custom'),
  data: z.record(dataQuery).optional(),
  templates: z.array(z.string()),
  request: requestSchema,
})

export type CustomRoutingContext = z.infer<typeof customRoutingContextSchema>

const redirectRoutingContextSchema = z.object({
  type: z.literal('redirect'),
  redirect: redirectSchema,
})

export type RedirectRoutingContext = z.infer<
  typeof redirectRoutingContextSchema
>

const routingContextSchema = z.discriminatedUnion('type', [
  collectionRoutingContextSchema,
  channelRoutingContextSchema,
  entryRoutingContextSchema,
  customRoutingContextSchema,
  redirectRoutingContextSchema,
  z.object({ type: z.literal('internal') }),
])

export type RoutingContext = z.infer<typeof routingContextSchema>
