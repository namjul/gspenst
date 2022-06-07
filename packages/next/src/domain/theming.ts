import { z } from '../shared-kernel'
import { resourceSchema } from './resource'
import { queryOutcomeSchema } from '../helpers/processQuery';

const themeContextBaseSchema = z.object({
  templates: z.array(z.string()),
  route: z.string(),
  data: z.record(queryOutcomeSchema),
  resource: resourceSchema,
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
