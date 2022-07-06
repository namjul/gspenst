import { z, idSchema } from '../shared/kernel'
import { configSchema } from './config'
import { postNormalizedSchema } from './post'
import { pageNormalizedSchema } from './page'
import { authorSchema } from './author'
import { tagSchema } from './tag'
import { limitSchema } from './routes'
import { resourceSchema, resourceTypeSchema } from './resource'

const paginationSchema = z.object({
  page: z.number(), // the current page number
  prev: z.number().nullable(), // the previous page number
  next: z.number().nullable(), // the next page number
  pages: z.number(), // the number of pages available
  total: z.number(), // the number of posts available
  limit: limitSchema, // the number of posts per page
})

export type Pagination = z.infer<typeof paginationSchema>

const readDataSchema = z.object({
  type: z.literal('read'),
  resourceType: resourceTypeSchema,
  resource: idSchema,
})

export type ReadData = z.infer<typeof readDataSchema>

const browseDataSchema = z.object({
  type: z.literal('browse'),
  resourceType: resourceTypeSchema,
  resources: z.array(idSchema),
  pagination: paginationSchema,
})

export type BrowseData = z.infer<typeof browseDataSchema>

const dataSchema = z.discriminatedUnion('type', [
  readDataSchema,
  browseDataSchema,
])

export type Data = z.infer<typeof dataSchema>

export const entriesEntitiesSchema = z
  .object({
    post: z.record(idSchema, postNormalizedSchema),
    page: z.record(idSchema, pageNormalizedSchema),
    author: z.record(idSchema, authorSchema),
    tag: z.record(idSchema, tagSchema),
  })
  .strict()

export type EntryEntities = z.infer<typeof entriesEntitiesSchema>

export const entitiesSchema = z
  .object({
    config: z.record(idSchema, configSchema),
    resource: z.record(idSchema, resourceSchema),
  })
  .merge(entriesEntitiesSchema)
  .strict()

export type Entities = z.infer<typeof entitiesSchema>

const pageThemeContextSchema = z
  .object({
    templates: z.array(z.string()),
    data: z.record(dataSchema),
    context: z.array(z.string()).nullable(),
    resource: resourceSchema,
    entities: entriesEntitiesSchema,
  })
  .strict()

export type PageThemeContext = z.infer<typeof pageThemeContextSchema>

const internalThemeContextSchema = z.object({
  context: z.literal('internal'),
})

// TODO rename file to themeContext?
export const themeContextSchema = z.union([
  pageThemeContextSchema,
  internalThemeContextSchema,
])

export type ThemeContext = z.infer<typeof themeContextSchema>
