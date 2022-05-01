import { z } from '../shared-kernel'
import { resourceSchema } from './resource'
import { limitSchema } from './routes'

const paginationSchema = z.object({
  page: z.number(), // the current page number
  prev: z.number().nullable(), // the previous page number
  next: z.number().nullable(), // the next page number
  pages: z.number(), // the number of pages available
  total: z.number(), // the number of posts available
  limit: limitSchema, // the number of posts per page
})

export type Pagination = z.infer<typeof paginationSchema>

const queryOutcomeRead = z.object({
  type: z.literal('read'),
  resource: resourceSchema,
})

export type QueryOutcomeRead = z.infer<typeof queryOutcomeRead>

const queryOutcomeBrowse = z.object({
  type: z.literal('browse'),
  pagination: paginationSchema,
  resources: z.array(resourceSchema),
})

export type QueryOutcomeBrowse = z.infer<typeof queryOutcomeBrowse>

export const queryOutcomeSchema = z.discriminatedUnion('type', [
  queryOutcomeRead,
  queryOutcomeBrowse,
])

export type QueryOutcome = z.infer<typeof queryOutcomeSchema>

const themeContextBaseSchema = z.object({
  templates: z.array(z.string()),
  route: z.string(),
  data: z.record(queryOutcomeSchema),
})

const postThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('post'),
  })
)

const pageThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('page'),
  })
)

const authorThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('author'),
  })
)

const tagThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('tag'),
  })
)

const indexThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('index'),
  })
)

const homeThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('home'),
  })
)

const pagesThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('pages'),
  })
)

const customThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal(null),
  })
)

const internalThemeContext = z.object({
  context: z.literal('internal'),
})


// TODO rename file to themeContext?
export const themeContext = z.discriminatedUnion('context', [
  postThemeContext,
  pageThemeContext,
  authorThemeContext,
  tagThemeContext,
  indexThemeContext,
  homeThemeContext,
  pagesThemeContext,
  customThemeContext,
  internalThemeContext,
])


export type ThemeContext = z.infer<typeof themeContext>
