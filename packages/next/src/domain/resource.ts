import { z } from 'zod'
import { getPostSchema, resourceType as resourceTypePost } from './post';
import { getPageSchema, resourceType as resourceTypePage } from './page';
import { getTagSchema, resourceType as resourceTypeTag } from './tag';
import { getAuthorSchema, resourceType as resourceTypeAuthor } from './author';

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
    resourceType: resourceTypePost,
    dataResult: getPostSchema.optional()
  })
)

const pageResource = resourceBaseSchema.merge(dynamicVariablesSchema).merge(
  z.object({
    resourceType: resourceTypePage,
    dataResult: getPageSchema.optional()
  })
)

const authorResource = resourceBaseSchema.merge(dynamicVariablesSchema).merge(
  z.object({
    resourceType: resourceTypeAuthor,
    dataResult: getAuthorSchema.optional()
  })
)

const tagResource = resourceBaseSchema.merge(dynamicVariablesSchema).merge(
  z.object({
    resourceType: resourceTypeTag,
    dataResult: getTagSchema.optional()
  })
)

const resourceSchema = z.discriminatedUnion('resourceType', [
  postResource,
  pageResource,
  authorResource,
  tagResource,
])

export type ResourceType = z.infer<typeof resourceTypeSchema>
export type Resource = z.infer<typeof resourceSchema>
export type DynamicVariables = z.infer<typeof dynamicVariablesSchema>
