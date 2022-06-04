import { z } from '../shared-kernel'
// import type { ID } from '../shared-kernel'
// import type { Resource } from './resource'
// import type { Post } from './post'
// import type { Page } from './page'
// import type { Author } from './author'
// import type { Tag } from './tag'
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

// const entitiesSchema = z.object({
//   resources: z.record(resourceNormalizedSchema),
// })

const themeContextBaseSchema = z.object({
  templates: z.array(z.string()),
  route: z.string(),
  // tinaData: z.object({}),
  // data: z.record(z.union([z.array(idSchema), idSchema])),
  // entities: entitiesSchema,
})

// type Data = {
//   data: {
//     [name: string]: {
//       resources: ID[]
//       posts: ID[]
//       pages: ID[]
//       authors: ID[]
//       tags: ID[]
//     }
//   }
//   entities: {
//     posts: { [id: ID]: PostResource }
//     pages: { [id: ID]: PageResource }
//     authors: { [id: ID]: AuthorResource }
//     tags: { [id: ID]: TagResource }
//   }
// }

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
