import { z } from '../shared-kernel'
import { queryOutcomeSchema } from '../helpers/processQuery'

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
