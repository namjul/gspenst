import { slugify } from '@tryghost/string'
import type { Get, Split, Result } from '../shared-kernel'
import { idSchema, ok, err, z } from '../shared-kernel'
import type { GetResourcesQuery } from '../../.tina/__generated__/types'
import type { GetTag, GetAuthor, GetPage, GetPost } from '../api'
import * as Errors from '../errors'

const getPostSchema = z.custom<GetPost>((value) => value)
const getPageSchema = z.custom<GetPage>((value) => value)
const getTagSchema = z.custom<GetTag>((value) => value)
const getAuthorSchema = z.custom<GetAuthor>((value) => value)

export const resourceTypePost = z.literal('post')
export const resourceTypePage = z.literal('page')
export const resourceTypeAuthor = z.literal('author')
export const resourceTypeTag = z.literal('tag')

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
  id: idSchema,
  filename: z.string(),
  path: z.string(),
  relativePath: z.string(),
  // url: z.string().url(),
})

const postResourceSchema = resourceBaseSchema
  .merge(dynamicVariablesSchema)
  .merge(
    z.object({
      resourceType: resourceTypePost,
      tinaData: getPostSchema.optional(),
    })
  )
export type PostResource = z.infer<typeof postResourceSchema>

const pageResourceSchema = resourceBaseSchema
  .merge(dynamicVariablesSchema)
  .merge(
    z.object({
      resourceType: resourceTypePage,
      tinaData: getPageSchema.optional(),
    })
  )

export type PageResource = z.infer<typeof pageResourceSchema>

const authorResourceSchema = resourceBaseSchema
  .merge(dynamicVariablesSchema)
  .merge(
    z.object({
      resourceType: resourceTypeAuthor,
      tinaData: getAuthorSchema.optional(),
    })
  )

export type AuthorResource = z.infer<typeof authorResourceSchema>

const tagResourceSchema = resourceBaseSchema
  .merge(dynamicVariablesSchema)
  .merge(
    z.object({
      resourceType: resourceTypeTag,
      tinaData: getTagSchema.optional(),
    })
  )

export type TagResource = z.infer<typeof tagResourceSchema>

const resourceSchema = z.discriminatedUnion('resourceType', [
  postResourceSchema,
  pageResourceSchema,
  authorResourceSchema,
  tagResourceSchema,
])

export type ResourceType = z.infer<typeof resourceTypeSchema>
export type Resource = z.infer<typeof resourceSchema>
export type DynamicVariables = z.infer<typeof dynamicVariablesSchema>

type ResourcesNode = Exclude<
  Get<GetResourcesQuery, 'getCollections[0].documents.edges[0].node'>,
  { __typename: 'ConfigDocument' }
>

export function createResource(
  node: NonNullable<ResourcesNode>
): Result<Resource> {
  const {
    sys: { filename, path: filepath, relativePath },
  } = node

  const dynamicVariables = generateDynamicVariables(node)

  const [resourceType] = node.__typename
    .toLowerCase()
    .split('document') as Split<Lowercase<typeof node.__typename>, 'document'>

  const resource = {
    id: node.id,
    filename,
    path: filepath,
    resourceType,
    relativePath,
    // url: 'http://jo',
    ...dynamicVariables,
  }

  const result = resourceSchema.safeParse(resource)

  if (result.success) {
    return ok(result.data)
  } else {
    return err(Errors.other('createResource', result.error))
  }
}

export function generateDynamicVariables(
  node: NonNullable<ResourcesNode>
): DynamicVariables {
  const {
    __typename,
    data,
    sys: { filename },
  } = node

  const [slug, primary_tag, primary_author] = (() => {
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    const empty = 'all'
    if (__typename === 'PageDocument' || __typename === 'PostDocument') {
      const tag = data.tags?.[0]?.tag
      const author = data.authors?.[0]?.author
      return [
        node.data.slug || filename,
        tag?.data.slug || tag?.sys.filename || empty,
        author?.data.slug || author?.sys.filename || empty,
      ]
    }
    return [data.slug || node.data.name || filename, empty, empty]
    /* eslint-enable */
  })() // IIFE

  const date = new Date(data.date)
  const [day, month, year] = date
    .toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .split('/')
    .map(Number) as [number, number, number]

  return {
    slug: slugify(slug),
    year,
    month,
    day,
    primary_tag,
    primary_author,
  }
}
