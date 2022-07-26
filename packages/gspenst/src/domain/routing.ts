import { z } from '../shared/kernel'
import { isString } from '../shared/utils'
import { dynamicVariablesSchema, locatorResourceTypeSchema } from './resource'
import { queryFilterOptions, dataQuery } from './routes'

export const routeTypeEntry = z.literal('entry')
export const routeTypeChannel = z.literal('channel')
export const routeTypeCollection = z.literal('collection')
export const routeTypeCustom = z.literal('custom')
export const routeTypeRedirect = z.literal('redirect')
export const routeTypeInternal = z.literal('internal')

export const routeTypes = [
  routeTypeEntry.value,
  routeTypeChannel.value,
  routeTypeCollection.value,
  routeTypeCustom.value,
  routeTypeRedirect.value,
  routeTypeInternal.value,
]

export const routeTypesSchema = z.union([
  routeTypeEntry,
  routeTypeChannel,
  routeTypeCollection,
  routeTypeCustom,
  routeTypeRedirect,
  routeTypeInternal,
])

export type RouteType = z.infer<typeof routeTypesSchema>

// TODO rename to routerContext/router? at least remove the word context

const redirectSchema = z.object({
  destination: z.string(),
  permanent: z.boolean(),
})

export type Redirect = z.infer<typeof redirectSchema>

export const paramsSchema = dynamicVariablesSchema
  .merge(
    z.object({
      page: z
        .preprocess((value) => {
          if (isString(value)) {
            return Number(value)
          }
          return value
        }, z.number())
        .optional(),
    })
  )
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
    type: routeTypeCollection,
  })
  .merge(baseRoutingContextSchema)
  .merge(queryFilterOptions)

export type CollectionRoutingContext = z.infer<
  typeof collectionRoutingContextSchema
>

const channelRoutingContextSchema = z
  .object({
    type: routeTypeChannel,
  })
  .merge(baseRoutingContextSchema)
  .merge(queryFilterOptions)

export type ChannelRoutingContext = z.infer<typeof channelRoutingContextSchema>

const entryRoutingContextSchema = z
  .object({
    type: routeTypeEntry,
    resourceType: locatorResourceTypeSchema,
  })
  .merge(baseRoutingContextSchema)

export type EntryRoutingContext = z.infer<typeof entryRoutingContextSchema>

const customRoutingContextSchema = z
  .object({
    type: routeTypeCustom,
  })
  .merge(baseRoutingContextSchema)

export type CustomRoutingContext = z.infer<typeof customRoutingContextSchema>

const redirectRoutingContextSchema = z.object({
  type: routeTypeRedirect,
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
  z.object({ type: routeTypeInternal }),
])

routingContextSchema.describe('routingContextSchema')

export type RoutingContext = z.infer<typeof routingContextSchema>
