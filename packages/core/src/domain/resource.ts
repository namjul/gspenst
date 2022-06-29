import type { Result } from '../shared/kernel'
import { idSchema, slugSchema, urlSchema, ok, err, z } from '../shared/kernel'
import { parse } from '../helpers/parser'
import {
  GetPostDocument,
  GetPageDocument,
  GetAuthorDocument,
  GetTagDocument,
  GetConfigDocument,
} from '../../.tina/__generated__/types'
import type {
  PostNodeFragment,
  PageNodeFragment,
  AuthorNodeFragment,
  TagNodeFragment,
  ThemeConfigNodeFragment as ConfigResourceNode,
} from '../../.tina/__generated__/types'
import type { GetTag, GetAuthor, GetPage, GetPost, GetConfig } from '../api'
import { do_, absurd } from '../shared/utils'

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
    urlPathname: urlSchema.optional(),
    filters: z.array(z.string()).nullable(),
  })
  .merge(dynamicVariablesSchema)

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const themeConfigFragmentSchema = z.custom<ConfigResourceNode>(
  (value: any) => '__typename' in value && value.__typename === 'Config'
)
const postFragmentSchema = z.custom<PostNodeFragment>(
  (value: any) => '__typename' in value && value.__typename === 'Post'
)
const pageFragmentSchema = z.custom<PageNodeFragment>(
  (value: any) => '__typename' in value && value.__typename === 'Page'
)
const tagFragmentSchema = z.custom<TagNodeFragment>(
  (value: any) => '__typename' in value && value.__typename === 'Tag'
)
const authorFragmentSchema = z.custom<AuthorNodeFragment>(
  (value: any) => '__typename' in value && value.__typename === 'Author'
)
/* eslint-enable @typescript-eslint/no-unsafe-member-access */

type Confify<T> = T & { data: { config?: ConfigResourceNode } }

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
  (postFragment): Confify<GetPost> => {
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
  (pageFragment): Confify<GetPage> => {
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
  (authorFragment): Confify<GetAuthor> => {
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

const tagTinaDataSchema = tagFragmentSchema.transform(
  (tagFragment): Confify<GetTag> => {
    return {
      data: {
        tag: tagFragment,
      },
      query: GetTagDocument,
      variables: {
        relativePath: tagFragment._sys.relativePath,
      },
    }
  }
)

export const configResourceSchema = resourceBaseSchema.merge(
  z.object({
    resourceType: resourceTypeConfig,
    tinaData: configTinaDataSchema,
  })
)

export type ConfigResource = z.infer<typeof configResourceSchema>

export const authorResourceSchema = resourceBaseSchema
  .merge(locatorResourceBaseSchema)
  .merge(
    z.object({
      resourceType: resourceTypeAuthor,
      tinaData: authorTinaDataSchema,
    })
  )

export type AuthorResource = z.infer<typeof authorResourceSchema>

export const tagResourceSchema = resourceBaseSchema
  .merge(locatorResourceBaseSchema)
  .merge(
    z.object({
      resourceType: resourceTypeTag,
      tinaData: tagTinaDataSchema,
    })
  )

export type TagResource = z.infer<typeof tagResourceSchema>

export const postResourceSchema = resourceBaseSchema
  .merge(locatorResourceBaseSchema)
  .merge(
    z.object({
      relationships: z.array(
        z.union([idSchema, authorResourceSchema, tagResourceSchema])
      ),
      resourceType: resourceTypePost,
      tinaData: postTinaDataSchema,
    })
  )

export type PostResource = z.infer<typeof postResourceSchema>

export const pageResourceSchema = resourceBaseSchema
  .merge(locatorResourceBaseSchema)
  .merge(
    z.object({
      relationships: z.array(
        z.union([idSchema, authorResourceSchema, tagResourceSchema])
      ),
      resourceType: resourceTypePage,
      tinaData: pageTinaDataSchema,
    })
  )

export type PageResource = z.infer<typeof pageResourceSchema>

export const resourceSchema = z.discriminatedUnion('resourceType', [
  configResourceSchema,
  postResourceSchema,
  pageResourceSchema,
  authorResourceSchema,
  tagResourceSchema,
])

export const locatorResourceSchema = z.discriminatedUnion('resourceType', [
  postResourceSchema,
  pageResourceSchema,
  authorResourceSchema,
  tagResourceSchema,
])

export type ResourceType = z.infer<typeof resourceTypeSchema>
export type Resource = z.infer<typeof resourceSchema>
export type LocatorResourceType = z.infer<typeof locatorResourceTypeSchema>
export type LocatorResource = z.infer<typeof locatorResourceSchema>
export type DynamicVariables = z.infer<typeof dynamicVariablesSchema>

export type LocatorResourceNode =
  | PostNodeFragment
  | PageNodeFragment
  | AuthorNodeFragment
  | TagNodeFragment

export type ResourceNode = LocatorResourceNode | ConfigResourceNode

export function createResource(
  node: ResourceNode,
  urlPathname: string | undefined,
  filters: string[] = []
): Result<Resource> {
  const isLocator = node.__typename !== 'Config'
  const isPost = node.__typename !== 'Post'
  const isPage = node.__typename !== 'Page'

  const dynamicVariablesResult = isLocator
    ? createDynamicVariables(node)
    : ok({})

  if (dynamicVariablesResult.isErr()) {
    return err(dynamicVariablesResult.error)
  }

  const dynamicVariables = dynamicVariablesResult.value

  const { _sys: { filename, path: filepath, relativePath } = {}, __typename } =
    node

  const baseResource = {
    id: node.id,
    filename,
    filepath,
    relativePath,
  }

  const locatorResource = isLocator
    ? {
        ...dynamicVariables,
        urlPathname,
        filters,
        ...(isPost || isPage
          ? {
              relationships: extractRelations(node).map(
                (relNode) => relNode.id
              ),
            }
          : {}),
      }
    : {}

  const resource = {
    ...baseResource,
    ...locatorResource,
    resourceType: __typename.toLowerCase(),
    tinaData: node,
  }

  return parse(resourceSchema, resource)
}

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

  const [day, month, year] = ('date' in node ? new Date(node.date) : new Date())
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

function extractRelations(node: LocatorResourceNode) {
  const { __typename } = node
  switch (__typename) {
    case 'Page':
    case 'Post': {
      return [...(node.tags ?? []), ...(node.authors ?? [])].flatMap(
        (childNode) => {
          if (childNode && 'tag' in childNode) {
            return childNode.tag ?? []
          }
          if (childNode && 'author' in childNode) {
            return childNode.author ?? []
          }
          return []
        }
      )
    }
    case 'Author':
    case 'Tag':
      return []
    default:
      return absurd(__typename)
  }
}

export type RoutingMapping = Record<
  LocatorResource['filepath'],
  LocatorResource['urlPathname']
>
export function createRoutingMapping(locatorResources: LocatorResource[]) {
  return locatorResources.reduce<RoutingMapping>((acc, resource) => {
    return {
      ...acc,
      [resource.filepath]: resource.urlPathname,
    }
  }, {})
}
