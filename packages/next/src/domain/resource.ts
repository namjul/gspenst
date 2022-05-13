import type { Get, Split, Result } from '../shared-kernel'
import { idSchema, slugSchema, ok, err, z } from '../shared-kernel'
import type { GetResourcesQuery } from '../../.tina/__generated__/types'
import { do_ } from '../shared/utils'
import * as Errors from '../errors'

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

export const dynamicVariablesSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  year: z.number(),
  month: z.number(),
  day: z.number(),
  primary_tag: z.string().default('all'),
  primary_author: z.string().default('all'),
})

const resourceBaseSchema = z
  .object({
    filename: z.string(),
    filepath: z.string(),
    relativePath: z.string(),
    urlPathname: z
      .string()
      .regex(/^\/([^?/]+)/)
      .optional(),
    filters: z.array(z.string()).nullable(),
  })
  .merge(dynamicVariablesSchema)

export const postResourceSchema = resourceBaseSchema.merge(
  z.object({
    resourceType: resourceTypePost,
  })
)

export type PostResource = z.infer<typeof postResourceSchema>

export const pageResourceSchema = resourceBaseSchema.merge(
  z.object({
    resourceType: resourceTypePage,
  })
)

export type PageResource = z.infer<typeof pageResourceSchema>

export const authorResourceSchema = resourceBaseSchema.merge(
  z.object({
    resourceType: resourceTypeAuthor,
  })
)

export type AuthorResource = z.infer<typeof authorResourceSchema>

export const tagResourceSchema = resourceBaseSchema.merge(
  z.object({
    resourceType: resourceTypeTag,
  })
)

export type TagResource = z.infer<typeof tagResourceSchema>

export const resourceSchema = z.discriminatedUnion('resourceType', [
  postResourceSchema,
  pageResourceSchema,
  authorResourceSchema,
  tagResourceSchema,
])

export type ResourceType = z.infer<typeof resourceTypeSchema>
export type Resource = z.infer<typeof resourceSchema>
export type DynamicVariables = z.infer<typeof dynamicVariablesSchema>

export type ResourcesNode = NonNullable<
  Exclude<
    Get<GetResourcesQuery, 'collections[0].documents.edges[0].node'>,
    { __typename: 'Config' }
  >
>

export function createResource(
  node: ResourcesNode,
  urlPathname: string | undefined,
  filters: string[] = []
): Result<Resource> {
  const {
    _sys: { filename, path: filepath, relativePath },
  } = node

  const dynamicVariablesResult = createDynamicVariables(node)

  if (dynamicVariablesResult.isErr()) {
    return err(dynamicVariablesResult.error)
  }

  const dynamicVariables = dynamicVariablesResult.value

  const [resourceType] = node.__typename
    .toLowerCase()
    .split('document') as Split<Lowercase<typeof node.__typename>, 'document'>

  const resource = {
    filename,
    filepath,
    resourceType,
    relativePath,
    urlPathname,
    filters,
    ...dynamicVariables,
  }

  const resourceParsed = resourceSchema.safeParse(resource)

  if (resourceParsed.success) {
    return ok(resourceParsed.data)
  } else {
    return err(Errors.other('createResource', resourceParsed.error))
  }
}

export function createDynamicVariables(
  node: ResourcesNode
): Result<DynamicVariables> {
  const {
    __typename,
    _sys: { filename },
    date,
  } = node

  const { slug, primary_tag, primary_author } = do_(() => {
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    const empty = 'all'
    if (__typename === 'Page' || __typename === 'Post') {
      const tag = node.tags?.[0]?.tag
      const author = node.authors?.[0]?.author
      return {
        slug: node.slug || filename,
        primary_tag: tag?.slug || tag?._sys.filename || empty,
        primary_author: author?.slug || author?._sys.filename || empty,
      }
    }
    return {
      slug: node.slug || node.name || filename,
      primary_tag: empty,
      primary_author: empty,
    }
    /* eslint-enable */
  })

  const [day, month, year] = new Date(date)
    .toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .split('/')
    .map(Number) as [number, number, number]

  const dynamicVariablesParsed = dynamicVariablesSchema.safeParse({
    id: node.id,
    slug,
    year,
    month,
    day,
    primary_tag,
    primary_author,
  })

  if (dynamicVariablesParsed.success) {
    return ok(dynamicVariablesParsed.data)
  } else {
    return err(Errors.other('createResource', dynamicVariablesParsed.error))
  }
}
