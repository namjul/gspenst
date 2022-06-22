import { z, idSchema } from '../shared/kernel'
import { configSchema } from './config'
import { postNormalizedSchema } from './post'
import { pageNormalizedSchema } from './page'
import { authorSchema } from './author'
import { tagSchema } from './tag'
import { limitSchema } from './routes'
import { resourceSchema } from './resource'

const paginationSchema = z.object({
  page: z.number(), // the current page number
  prev: z.number().nullable(), // the previous page number
  next: z.number().nullable(), // the next page number
  pages: z.number(), // the number of pages available
  total: z.number(), // the number of posts available
  limit: limitSchema, // the number of posts per page
})

export type Pagination = z.infer<typeof paginationSchema>

const dataSchema = z.record(
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('read'), resource: idSchema }),
    z.object({
      type: z.literal('browse'),
      resources: z.array(idSchema),
      pagination: paginationSchema,
    }),
  ])
)

export type Data = z.infer<typeof dataSchema>

export const entitiesSchema = z
  .object({
    configs: z.record(idSchema, configSchema),
    posts: z.record(idSchema, postNormalizedSchema),
    pages: z.record(idSchema, pageNormalizedSchema),
    authors: z.record(idSchema, authorSchema),
    tags: z.record(idSchema, tagSchema),
    resources: z.record(idSchema, resourceSchema),
  })
  .partial()
  .strict()

export type Entities = z.infer<typeof entitiesSchema>

const themeContextSchema = z
  .object({
    templates: z.array(z.string()),
    route: z.string(),
    data: dataSchema,
    context: z.array(z.string()).nullable(),
    resource: resourceSchema,
    entities: entitiesSchema,
  })
  .strict()

const internalThemeContext = z.object({
  context: z.literal('internal'),
})

// TODO rename file to themeContext?
export const themeContext = z.union([themeContextSchema, internalThemeContext])

export type ThemeContext = z.infer<typeof themeContext>
