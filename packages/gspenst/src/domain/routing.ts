import { z } from '../shared/kernel'
import { dynamicVariablesSchema, locatorResourceTypeSchema } from './resource'
import { queryFilterOptions, dataQuery } from './routes'

// TODO rename to routerContext/router? at least remove the word context

const redirectSchema = z.object({
  destination: z.string(),
  permanent: z.boolean(),
})

export type Redirect = z.infer<typeof redirectSchema>

export const paramsSchema = dynamicVariablesSchema
  .merge(z.object({ page: z.number().optional() }))
  .partial()

const requestSchema = z.object({
  path: z.string(),
  params: paramsSchema.optional(),
})

export type Request = z.infer<typeof requestSchema>

const baseRoutingContextSchema = z.object({
  name: z.string().optional(),
  data: z.record(dataQuery),
  templates: z.array(z.string()),
  request: requestSchema,
})

const collectionRoutingContextSchema = z
  .object({
    type: z.literal('collection'),
  })
  .merge(baseRoutingContextSchema)
  .merge(queryFilterOptions)

export type CollectionRoutingContext = z.infer<
  typeof collectionRoutingContextSchema
>

const channelRoutingContextSchema = z
  .object({
    type: z.literal('channel'),
  })
  .merge(baseRoutingContextSchema)
  .merge(queryFilterOptions)

export type ChannelRoutingContext = z.infer<typeof channelRoutingContextSchema>

const entryRoutingContextSchema = z
  .object({
    type: z.literal('entry'),
    resourceType: locatorResourceTypeSchema,
  })
  .merge(baseRoutingContextSchema)

export type EntryRoutingContext = z.infer<typeof entryRoutingContextSchema>

const customRoutingContextSchema = z
  .object({
    type: z.literal('custom'),
  })
  .merge(baseRoutingContextSchema)

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

routingContextSchema.describe('routingContextSchema')

export type RoutingContext = z.infer<typeof routingContextSchema>
