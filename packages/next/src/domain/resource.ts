import { z } from 'zod'

const resourceTypePost = z.literal('post')
const resourceTypePage = z.literal('page')
const resourceTypeAuthor = z.literal('author')
const resourceTypeTag = z.literal('tag')

export const resourceTypes = [
  resourceTypePost.value,
  resourceTypePage.value,
  resourceTypeAuthor.value,
  resourceTypeTag.value,
]

export const resourceTypeSchema = z.union([
  resourceTypePost,
  resourceTypePage,
  resourceTypeAuthor,
  resourceTypeTag,
])

export const dynamicVariablesSchema = z
  .object({
    slug: z.string(),
    year: z.number(),
    month: z.number(),
    day: z.number(),
    primary_tag: z.string(),
    primary_author: z.string(),
  })
  .strict()

const resourceBaseSchema = z.object({
  id: z.string(), // TODO z.uuid()
  filename: z.string(),
  path: z.string(),
  relativePath: z.string(),
})

const postResource = resourceBaseSchema.merge(dynamicVariablesSchema).merge(
  z.object({
    type: resourceTypePost,
    // dataResult: TODO
  })
)

const pageResource = resourceBaseSchema.merge(dynamicVariablesSchema).merge(
  z.object({
    type: resourceTypePage,
  })
)

const authorResource = resourceBaseSchema.merge(dynamicVariablesSchema).merge(
  z.object({
    type: resourceTypeAuthor,
  })
)

const tagResource = resourceBaseSchema.merge(dynamicVariablesSchema).merge(
  z.object({
    type: resourceTypeTag,
  })
)

const resourceSchema = z.discriminatedUnion('type', [
  postResource,
  pageResource,
  authorResource,
  tagResource,
])

export type ResourceType = z.infer<typeof resourceTypeSchema>
export type Resource = z.infer<typeof resourceSchema>
export type DynamicVariables = z.infer<typeof dynamicVariablesSchema>
