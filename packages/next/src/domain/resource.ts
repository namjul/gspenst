import type { Result } from '../shared-kernel'
import { idSchema, slugSchema, ok, err, z } from '../shared-kernel'
import {
  GetPostDocument,
  GetPageDocument,
  GetAuthorDocument,
  GetTagDocument,
  GetConfigDocument,
} from '../../.tina/__generated__/types'
import type {
  PostFragmentFragment,
  PageFragmentFragment,
  AuthorFragmentFragment,
  TagFragmentFragment,
  ThemeConfigFragmentFragment,
} from '../../.tina/__generated__/types'
import type { GetTag, GetAuthor, GetPage, GetPost, GetConfig } from '../api'
import { do_ } from '../shared/utils'
import * as Errors from '../errors'

export const resourceTypeConfig = z.literal('config')
export const resourceTypePost = z.literal('post')
export const resourceTypePage = z.literal('page')
export const resourceTypeAuthor = z.literal('author')
export const resourceTypeTag = z.literal('tag')

export const resourceTypeSchema = z.union([
  resourceTypeConfig,
  resourceTypePost,
  resourceTypePage,
  resourceTypeAuthor,
  resourceTypeTag,
])

export const dynamicVariablesSchema = z.object({
  slug: slugSchema,
  year: z.number(),
  month: z.number(),
  day: z.number(),
  primary_tag: z.string().default('all'),
  primary_author: z.string().default('all'),
})

const resourceBaseSchema = z.object({
  id: idSchema,
  filename: z.string(),
  filepath: z.string(),
  relativePath: z.string(),
  urlPathname: z
    .string()
    .regex(/^\/([^?/]+)/)
    .optional(),
  filters: z.array(z.string()).nullable(),
})

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const themeConfigFragmentSchema = z.custom<ThemeConfigFragmentFragment>(
  (value: any) => '__typename' in value && value.__typename === 'Config'
)
const postFragmentSchema = z.custom<PostFragmentFragment>(
  (value: any) => '__typename' in value && value.__typename === 'Post'
)
const pageFragmentSchema = z.custom<PageFragmentFragment>(
  (value: any) => '__typename' in value && value.__typename === 'Page'
)
const tagFragmentSchema = z.custom<TagFragmentFragment>(
  (value: any) => '__typename' in value && value.__typename === 'Tag'
)
const authorFragmentSchema = z.custom<AuthorFragmentFragment>(
  (value: any) => '__typename' in value && value.__typename === 'Author'
)
/* eslint-enable @typescript-eslint/no-unsafe-member-access */

const configTinaDataSchema = themeConfigFragmentSchema.transform(
  (themeConfigFragment): GetConfig => {
    return {
      data: {
        config: themeConfigFragment,
      },
      query: GetConfigDocument,
      variables: {},
    }
  }
)

const postTinaDataSchema = postFragmentSchema.transform(
  (postFragment): GetPost => {
    return {
      data: {
        post: postFragment,
      },
      query: GetPostDocument,
      variables: {
        relativePath: postFragment._sys.relativePath,
      },
    }
  }
)

const pageTinaDataSchema = pageFragmentSchema.transform(
  (pageFragment): GetPage => {
    return {
      data: {
        page: pageFragment,
      },
      query: GetPageDocument,
      variables: {
        relativePath: pageFragment._sys.relativePath,
      },
    }
  }
)

const authorTinaDataSchema = authorFragmentSchema.transform(
  (authorFragment): GetAuthor => {
    return {
      data: {
        author: authorFragment,
      },
      query: GetAuthorDocument,
      variables: {
        relativePath: authorFragment._sys.relativePath,
      },
    }
  }
)

const tagTinaDataSchema = tagFragmentSchema.transform((tagFragment): GetTag => {
  return {
    data: {
      tag: tagFragment,
    },
    query: GetTagDocument,
    variables: {
      relativePath: tagFragment._sys.relativePath,
    },
  }
})

export const themeConfigResourceSchema = resourceBaseSchema.merge(
  z.object({
    resourceType: resourceTypeConfig,
    tinaData: configTinaDataSchema,
  })
)

export type ConfigResource = z.infer<typeof themeConfigResourceSchema>

export const postResourceSchema = resourceBaseSchema
  .merge(dynamicVariablesSchema)
  .merge(
    z.object({
      resourceType: resourceTypePost,
      tinaData: postTinaDataSchema,
    })
  )

export type PostResource = z.infer<typeof postResourceSchema>

export const pageResourceSchema = resourceBaseSchema
  .merge(dynamicVariablesSchema)
  .merge(
    z.object({
      resourceType: resourceTypePage,
      tinaData: pageTinaDataSchema,
    })
  )

export type PageResource = z.infer<typeof pageResourceSchema>

export const authorResourceSchema = resourceBaseSchema
  .merge(dynamicVariablesSchema)
  .merge(
    z.object({
      resourceType: resourceTypeAuthor,
      tinaData: authorTinaDataSchema,
    })
  )

export type AuthorResource = z.infer<typeof authorResourceSchema>

export const tagResourceSchema = resourceBaseSchema
  .merge(dynamicVariablesSchema)
  .merge(
    z.object({
      resourceType: resourceTypeTag,
      tinaData: tagTinaDataSchema,
    })
  )

export type TagResource = z.infer<typeof tagResourceSchema>

export const resourceSchema = z.discriminatedUnion('resourceType', [
  themeConfigResourceSchema,
  postResourceSchema,
  pageResourceSchema,
  authorResourceSchema,
  tagResourceSchema,
])

export type ResourceType = z.infer<typeof resourceTypeSchema>
export type Resource = z.infer<typeof resourceSchema>
export type DynamicVariables = z.infer<typeof dynamicVariablesSchema>

type PagesResourceNode =
  | PostFragmentFragment
  | PageFragmentFragment
  | AuthorFragmentFragment
  | TagFragmentFragment

export type ResourceNode = PagesResourceNode | ThemeConfigFragmentFragment

export function createResource(
  node: ResourceNode,
  urlPathname: string | undefined,
  filters: string[] = []
): Result<Resource> {
  const dynamicVariablesResult =
    node.__typename === 'Config' ? ok({}) : createDynamicVariables(node)

  if (dynamicVariablesResult.isErr()) {
    return err(dynamicVariablesResult.error)
  }

  const dynamicVariables = dynamicVariablesResult.value

  const { _sys: { filename, path: filepath, relativePath } = {}, __typename } =
    node

  const resource = {
    id: node.id,
    filename,
    filepath,
    resourceType: __typename.toLowerCase(),
    relativePath,
    urlPathname,
    filters,
    tinaData: node,
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
  node: Partial<PagesResourceNode>
): Result<DynamicVariables> {
  const { _sys: { filename } = {} } = node

  const { slug, primary_tag, primary_author } = do_(() => {
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    const empty = 'all'
    if ('tags' in node || 'authors' in node) {
      const tag = node.tags?.[0]?.tag
      const author = node.authors?.[0]?.author
      return {
        slug: node.slug || filename,
        primary_tag: tag?.slug || tag?._sys.filename || empty,
        primary_author: author?.slug || author?._sys.filename || empty,
      }
    }
    return {
      slug:
        ('slug' in node && node.slug) ||
        ('name' in node && node.name) ||
        filename,
      primary_tag: empty,
      primary_author: empty,
    }
    /* eslint-enable */
  })

  const [day, month, year] = ('date' in node ? new Date(node.date) : new Date())
    .toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .split('/')
    .map(Number) as [number, number, number]

  const dynamicVariablesParsed = dynamicVariablesSchema.safeParse({
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
