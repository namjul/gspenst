import { z, idSchema, pathSchema } from '../shared/kernel'
import { limitSchema } from './routes'
import { resourceSchema, resourceTypeSchema } from './resource'
import { entriesEntitiesSchema } from './entity'

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

const pageThemeContextSchema = z
  .object({
    // TODO merge context and templates into single field
    templates: z.array(z.string()),
    data: z.record(dataSchema),
    context: z.array(z.string()).nullable(),
    resource: resourceSchema,
    entities: entriesEntitiesSchema,
    route: pathSchema,
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
