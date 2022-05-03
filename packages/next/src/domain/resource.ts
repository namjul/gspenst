import type { Get, Split, Result } from '../shared-kernel'
import { idSchema, slugSchema, ok, err, z } from '../shared-kernel'
import type { GetTag, GetAuthor, GetPage, GetPost } from '../api'
import { do_ } from '../utils'
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
  })
  .merge(dynamicVariablesSchema)

export const postResourceSchema = resourceBaseSchema.merge(
  z.object({
    resourceType: resourceTypePost,
    tinaData: getPostSchema,
  })
)
export type PostResource = z.infer<typeof postResourceSchema>

export const pageResourceSchema = resourceBaseSchema.merge(
  z.object({
    resourceType: resourceTypePage,
    tinaData: getPageSchema,
  })
)

export type PageResource = z.infer<typeof pageResourceSchema>

export const authorResourceSchema = resourceBaseSchema.merge(
  z.object({
    resourceType: resourceTypeAuthor,
    tinaData: getAuthorSchema,
  })
)

export type AuthorResource = z.infer<typeof authorResourceSchema>

export const tagResourceSchema = resourceBaseSchema.merge(
  z.object({
    resourceType: resourceTypeTag,
    tinaData: getTagSchema,
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

type ResourcesNode = NonNullable<
  | Get<GetPage, 'data.page'>
  | Get<GetPost, 'data.post'>
  | Get<GetAuthor, 'data.author'>
  | Get<GetTag, 'data.tag'>
>

export function createResource(
  node: ResourcesNode,
  urlPathname?: string
): Result<Resource> {
  const {
    __typename,
    _sys: { filename, path: filepath, relativePath },
    date,
    id,
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

  const dynamicVariablesParsedResult = dynamicVariablesSchema.safeParse({
    id,
    slug,
    year,
    month,
    day,
    primary_tag,
    primary_author,
  })

  if (!dynamicVariablesParsedResult.success) {
    return err(Errors.other('createResource', dynamicVariablesParsedResult.error))
  }

  const dynamicVariables = dynamicVariablesParsedResult.data

  const [resourceType] = node.__typename
    .toLowerCase()
    .split('document') as Split<Lowercase<typeof node.__typename>, 'document'>

  const resource = {
    filename,
    filepath,
    resourceType,
    relativePath,
    urlPathname: urlPathname ?? `/${dynamicVariables.id}`,
    ...dynamicVariables,
  }

  const result = resourceSchema.safeParse(resource)

  if (result.success) {
    return ok(result.data)
  } else {
    return err(Errors.other('createResource', result.error))
  }
}
