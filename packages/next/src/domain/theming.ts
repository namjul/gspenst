import { z } from '../shared-kernel'
import type { GetTag, GetAuthor, GetPage, GetPost } from '../api'
import {
  postResourceSchema,
  pageResourceSchema,
  authorResourceSchema,
  tagResourceSchema,
} from './resource'
import { limitSchema } from './routes'

const getPostSchema = z.custom<GetPost>((value) => value)
const getPageSchema = z.custom<GetPage>((value) => value)
const getTagSchema = z.custom<GetTag>((value) => value)
const getAuthorSchema = z.custom<GetAuthor>((value) => value)

const paginationSchema = z.object({
  page: z.number(), // the current page number
  prev: z.number().nullable(), // the previous page number
  next: z.number().nullable(), // the next page number
  pages: z.number(), // the number of pages available
  total: z.number(), // the number of posts available
  limit: limitSchema, // the number of posts per page
})

export type Pagination = z.infer<typeof paginationSchema>

export const resourceDataSchema = z.discriminatedUnion('resourceType', [
  postResourceSchema.merge(z.object({ tinaData: getPostSchema })),
  pageResourceSchema.merge(z.object({ tinaData: getPageSchema })),
  authorResourceSchema.merge(z.object({ tinaData: getAuthorSchema })),
  tagResourceSchema.merge(z.object({ tinaData: getTagSchema })),
])

export type ResourceData = z.infer<typeof resourceDataSchema>

export const queryOutcomeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('read'),
    resource: resourceDataSchema,
  }),
  z.object({
    type: z.literal('browse'),
    resources: z.array(resourceDataSchema),
    pagination: paginationSchema,
  }),
])

export type QueryOutcome = z.infer<typeof queryOutcomeSchema>

// const queryOutcomeRead = z.object({
//   type: z.literal('read'),
//   resource: resourceSchema,
// })
//
// export type QueryOutcomeRead = z.infer<typeof queryOutcomeRead>
//
// const queryOutcomeBrowse = z.object({
//   type: z.literal('browse'),
//   pagination: paginationSchema,
//   resources: z.array(resourceSchema),
// })
//
// export type QueryOutcomeBrowse = z.infer<typeof queryOutcomeBrowse>
//
// export const queryOutcomeSchema = z.discriminatedUnion('type', [
//   queryOutcomeRead,
//   queryOutcomeBrowse,
// ])
//
// export type QueryOutcome = z.infer<typeof queryOutcomeSchema>

const themeContextBaseSchema = z.object({
  templates: z.array(z.string()),
  route: z.string(),
  data: z.record(queryOutcomeSchema),
})

const postThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('post'),
    // resource: postResourceSchema,
  })
)

const pageThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('page'),
    // resource: pageResourceSchema,
  })
)

const authorThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('author'),
    // resource: authorResourceSchema,
  })
)

const tagThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('tag'),
    // resource: tagResourceSchema,
  })
)

const indexThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('index'),
    // resource: configResourceSchema,
    // resources: z.array(resourceSchema),
    // pagination: paginationSchema,
  })
)

const homeThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('home'),
    // resource: configResourceSchema,
    // resources: z.array(resourceSchema),
    // pagination: paginationSchema,
  })
)

const pagesThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal('pages'),
    // resource: configResourceSchema,
    // resources: z.array(resourceSchema),
    // pagination: paginationSchema,
  })
)

const customThemeContext = themeContextBaseSchema.merge(
  z.object({
    context: z.literal(null),
    // resource: configResourceSchema,
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
