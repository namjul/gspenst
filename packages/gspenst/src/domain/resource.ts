import type { Result } from '../shared/kernel'
import { idSchema, slugSchema, pathSchema, ok, err, z } from '../shared/kernel'
import { parse } from '../helpers/parser'
import type {
  PostNodeFragment,
  PageNodeFragment,
  AuthorNodeFragment,
  TagNodeFragment,
  ThemeConfigNodeFragment,
} from '../../.tina/__generated__/types'
import {
  GetPostDocument,
  GetPageDocument,
  GetAuthorDocument,
  GetTagDocument,
  GetConfigDocument,
} from '../../.tina/__generated__/types'
import type { ApiEntity } from '../api'
import { assertUnreachable, do_ } from '../shared/utils'

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const isConfigNode = (value: any): value is ThemeConfigNodeFragment =>
  '__typename' in value && value.__typename === 'Config'
const isPostNode = (value: any): value is PostNodeFragment =>
  '__typename' in value && value.__typename === 'Post'
const isPageNode = (value: any): value is PostNodeFragment =>
  '__typename' in value && value.__typename === 'Page'
const isTagNode = (value: any): value is TagNodeFragment =>
  '__typename' in value && value.__typename === 'Tag'
const isAuthorNode = (value: any): value is AuthorNodeFragment =>
  '__typename' in value && value.__typename === 'Author'
/* eslint-enable @typescript-eslint/no-unsafe-member-access */

const configFragmentSchema = z.custom<ThemeConfigNodeFragment>((value: any) =>
  isConfigNode(value)
)

export const configTinaDataSchema = z
  .preprocess(
    (value) => {
      return {
        data: {
          config: value,
        },
        query: GetConfigDocument,
        variables: {},
      }
    },
    z.object({
      data: z.object({
        config: configFragmentSchema,
      }),
      query: z.string(),
      variables: z.object({}),
    })
  )
  .describe('configTinaDataSchema')

const postFragmentSchema = z.custom<PostNodeFragment>((value: any) =>
  isPostNode(value)
)

export const postTinaDataSchema = z
  .preprocess(
    (value) => {
      return {
        data: {
          post: value,
        },
        query: GetPostDocument,
        variables: {
          relativePath: isPostNode(value) ? value._sys.relativePath : undefined,
        },
      }
    },
    z.object({
      data: z.object({
        config: configFragmentSchema.optional(),
        post: postFragmentSchema,
      }),
      query: z.string(),
      variables: z.object({
        relativePath: z.string(),
      }),
    })
  )
  .describe('postTinaDataSchema')

const pageFragmentSchema = z.custom<PageNodeFragment>((value: any) =>
  isPageNode(value)
)

export const pageTinaDataSchema = z
  .preprocess(
    (value) => {
      return {
        data: {
          page: value,
        },
        query: GetPageDocument,
        variables: {
          relativePath: isPageNode(value) ? value._sys.relativePath : undefined,
        },
      }
    },
    z.object({
      data: z.object({
        config: configFragmentSchema.optional(),
        page: pageFragmentSchema,
      }),
      query: z.string(),
      variables: z.object({
        relativePath: z.string(),
      }),
    })
  )
  .describe('pageTinaDataSchema')

const tagFragmentSchema = z.custom<TagNodeFragment>((value: any) =>
  isTagNode(value)
)

export const tagTinaDataSchema = z
  .preprocess(
    (value) => {
      return {
        data: {
          tag: value,
        },
        query: GetTagDocument,
        variables: {
          relativePath: isTagNode(value) ? value._sys.relativePath : undefined,
        },
      }
    },
    z.object({
      data: z.object({
        config: configFragmentSchema.optional(),
        tag: tagFragmentSchema,
      }),
      query: z.string(),
      variables: z.object({
        relativePath: z.string(),
      }),
    })
  )
  .describe('tagTinaDataSchema')

const authorFragmentSchema = z.custom<AuthorNodeFragment>((value: any) =>
  isAuthorNode(value)
)

export const authorTinaDataSchema = z
  .preprocess(
    (value) => {
      return {
        data: {
          author: value,
        },
        query: GetAuthorDocument,
        variables: {
          relativePath: isAuthorNode(value)
            ? value._sys.relativePath
            : undefined,
        },
      }
    },
    z.object({
      data: z.object({
        config: configFragmentSchema.optional(),
        author: authorFragmentSchema,
      }),
      query: z.string(),
      variables: z.object({
        relativePath: z.string(),
      }),
    })
  )
  .describe('authorTinaDataSchema')

export const resourceTypeConfig = z.literal('config')
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
  resourceTypeConfig,
  resourceTypePost,
  resourceTypePage,
  resourceTypeAuthor,
  resourceTypeTag,
])

export const locatorResourceTypes = [
  resourceTypePost.value,
  resourceTypePage.value,
  resourceTypeAuthor.value,
  resourceTypeTag.value,
]

export const locatorResourceTypeSchema = z.union([
  resourceTypePost,
  resourceTypePage,
  resourceTypeAuthor,
  resourceTypeTag,
])

const resourceBaseSchema = z.object({
  id: idSchema,
  filename: z.string(),
  filepath: z.string(),
  relativePath: z.string(),
  breadcrumbs: z.array(z.string()),
  timestamp: z.number().optional(),
})

export const dynamicVariablesSchema = z.object({
  slug: slugSchema,
  year: z.number(),
  month: z.number(),
  day: z.number(),
  primary_tag: z.string().default('all'),
  primary_author: z.string().default('all'),
})

const locatorResourceBaseSchema = z
  .object({
    path: pathSchema,
    filters: z.array(z.string()).default([]),
  })
  .merge(dynamicVariablesSchema)

export const configResourceSchema = resourceBaseSchema.merge(
  z.object({
    type: resourceTypeConfig,
    tinaData: configTinaDataSchema,
  })
)

export type ConfigResource = z.infer<typeof configResourceSchema>

export const authorResourceSchema = resourceBaseSchema
  .merge(locatorResourceBaseSchema)
  .merge(
    z.object({
      type: resourceTypeAuthor,
      tinaData: authorTinaDataSchema,
    })
  )

export type AuthorResource = z.infer<typeof authorResourceSchema>

export const tagResourceSchema = resourceBaseSchema
  .merge(locatorResourceBaseSchema)
  .merge(
    z.object({
      type: resourceTypeTag,
      tinaData: tagTinaDataSchema,
    })
  )

export type TagResource = z.infer<typeof tagResourceSchema>

export const postResourceSchema = resourceBaseSchema
  .merge(locatorResourceBaseSchema)
  .merge(
    z.object({
      type: resourceTypePost,
      tinaData: postTinaDataSchema,
    })
  )

export type PostResource = z.infer<typeof postResourceSchema>

export const pageResourceSchema = resourceBaseSchema
  .merge(locatorResourceBaseSchema)
  .merge(
    z.object({
      type: resourceTypePage,
      tinaData: pageTinaDataSchema,
    })
  )

export type PageResource = z.infer<typeof pageResourceSchema>

export const resourceSchema = z
  .discriminatedUnion('type', [
    configResourceSchema,
    postResourceSchema,
    pageResourceSchema,
    authorResourceSchema,
    tagResourceSchema,
  ])
  .describe('resourceSchema')

export const locatorResourceSchema = z
  .discriminatedUnion('type', [
    postResourceSchema,
    pageResourceSchema,
    authorResourceSchema,
    tagResourceSchema,
  ])
  .describe('locatorResourceSchema')

export type ResourceType = z.infer<typeof resourceTypeSchema>
export type Resource = z.infer<typeof resourceSchema>
export type LocatorResourceType = z.infer<typeof locatorResourceTypeSchema>
export type LocatorResource = z.infer<typeof locatorResourceSchema>
export type DynamicVariables = z.infer<typeof dynamicVariablesSchema>

export function createResource(entity: ApiEntity): Result<Resource> {
  const timestamp = 'timestamp' in entity ? entity.timestamp : undefined

  const node = do_(() => {
    const { type, data } = entity
    switch (type) {
      case 'post':
        return data.data.post
      case 'page':
        return data.data.page
      case 'author':
        return data.data.author
      case 'tag':
        return data.data.tag
      case 'config':
        return data.data.config
      default:
        assertUnreachable(type, 'createResource')
    }
  })

  const dynamicVariablesResult =
    node.__typename === 'Config' ? ok({}) : createDynamicVariables(node)

  if (dynamicVariablesResult.isErr()) {
    return err(dynamicVariablesResult.error)
  }

  const dynamicVariables = dynamicVariablesResult.value

  const {
    _sys: { filename, path: filepath, relativePath, breadcrumbs } = {},
    __typename,
  } = node

  const idResult = parse(idSchema, node.id)

  if (idResult.isErr()) {
    return err(idResult.error)
  }

  const baseResource = {
    id: idResult.value,
    filename,
    filepath,
    relativePath,
    breadcrumbs,
    timestamp,
  }

  const resource = {
    ...baseResource,
    ...dynamicVariables,
    type: __typename.toLowerCase(),
    tinaData: node,
    path: `/${idResult.value}`,
  }

  return parse(resourceSchema, resource)
}

export type LocatorResourceNode =
  | PostNodeFragment
  | PageNodeFragment
  | AuthorNodeFragment
  | TagNodeFragment

export function createDynamicVariables(
  node: Partial<LocatorResourceNode>
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

  const [day, month, year] = (node.date ? new Date(node.date) : new Date())
    .toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .split('/')
    .map(Number) as [number, number, number]

  return parse(dynamicVariablesSchema, {
    slug,
    year,
    month,
    day,
    primary_tag,
    primary_author,
  })
}
