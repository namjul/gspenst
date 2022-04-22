import { slugify } from '@tryghost/string'
import type { Get, Split, Result } from '../shared-kernel'
import { idSchema, ok, err, z } from '../shared-kernel'
import type { GetResourcesQuery } from '../../.tina/__generated__/types'
import * as Errors from '../errors'
import { getPostSchema, resourceType as resourceTypePost } from './post'
import { getPageSchema, resourceType as resourceTypePage } from './page'
import { getTagSchema, resourceType as resourceTypeTag } from './tag'
import { getAuthorSchema, resourceType as resourceTypeAuthor } from './author'

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
})

const postResource = resourceBaseSchema.merge(dynamicVariablesSchema).merge(
  z.object({
    resourceType: resourceTypePost,
    dataResult: getPostSchema.optional(),
  })
)

const pageResource = resourceBaseSchema.merge(dynamicVariablesSchema).merge(
  z.object({
    resourceType: resourceTypePage,
    dataResult: getPageSchema.optional(),
  })
)

const authorResource = resourceBaseSchema.merge(dynamicVariablesSchema).merge(
  z.object({
    resourceType: resourceTypeAuthor,
    dataResult: getAuthorSchema.optional(),
  })
)

const tagResource = resourceBaseSchema.merge(dynamicVariablesSchema).merge(
  z.object({
    resourceType: resourceTypeTag,
    dataResult: getTagSchema.optional(),
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

  const idResult = idSchema.safeParse(node.id)

  if (idResult.success) {
    return ok({
      id: idResult.data,
      filename,
      path: filepath,
      resourceType,
      relativePath,
      ...dynamicVariables,
    })
  }

  return err(Errors.other('createResource', idResult.error))
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
