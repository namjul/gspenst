import {
  idSchema,
  slugSchema,
  pathSchema,
  GspenstResult,
  Option,
  err,
  z,
  do_,
} from '../../shared/kernel'
import { parse } from '../../helpers/parser'
import {
  type PostNodeFragment,
  type PageNodeFragment,
  type AuthorNodeFragment,
  type TagNodeFragment,
  GetPostDocument,
  GetPageDocument,
  GetAuthorDocument,
  GetTagDocument,
} from '../../.tina/__generated__/types'
import { configFragmentSchema, resourceTypeConfig } from './resource.config'
import { resourceBaseSchema } from './resource.base'

/**
 * I discovered the name locator in https://de.wikipedia.org/wiki/Uniform_Resource_Locator
 * The semantic meaning is that, distict to other resources, locator resources than can be targeted by a URL.
 */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const isPostNode = (value: any): value is PostNodeFragment =>
  '__typename' in value && value.__typename === 'Post'
const isPageNode = (value: any): value is PostNodeFragment =>
  '__typename' in value && value.__typename === 'Page'
const isTagNode = (value: any): value is TagNodeFragment =>
  '__typename' in value && value.__typename === 'Tag'
const isAuthorNode = (value: any): value is AuthorNodeFragment =>
  '__typename' in value && value.__typename === 'Author'
/* eslint-enable @typescript-eslint/no-unsafe-member-access */

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

export const dynamicVariablesSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  year: z.number(),
  month: z.number(),
  day: z.number(),
  primary_tag: z.string().default('all'),
  primary_author: z.string().default('all'),
})

const locatorResourceBaseSchema = z.object({
  metadata: z
    .object({
      breadcrumbs: z.array(z.string()),
      path: pathSchema,
      relativePath: z.string(),
      filters: z.array(z.string()).default([]),
    })
    .merge(dynamicVariablesSchema),
})

export const authorResourceSchema = resourceBaseSchema
  .merge(locatorResourceBaseSchema)
  .merge(
    z.object({
      type: resourceTypeAuthor,
      data: authorTinaDataSchema,
    })
  )

export type AuthorResource = z.infer<typeof authorResourceSchema>

export const tagResourceSchema = resourceBaseSchema
  .merge(locatorResourceBaseSchema)
  .merge(
    z.object({
      type: resourceTypeTag,
      data: tagTinaDataSchema,
    })
  )

export type TagResource = z.infer<typeof tagResourceSchema>

export const postResourceSchema = resourceBaseSchema
  .merge(locatorResourceBaseSchema)
  .merge(
    z.object({
      type: resourceTypePost,
      data: postTinaDataSchema,
    })
  )

export type PostResource = z.infer<typeof postResourceSchema>

export const pageResourceSchema = resourceBaseSchema
  .merge(locatorResourceBaseSchema)
  .merge(
    z.object({
      type: resourceTypePage,
      data: pageTinaDataSchema,
    })
  )

export type PageResource = z.infer<typeof pageResourceSchema>

export const locatorResourceSchema = z
  .discriminatedUnion('type', [
    postResourceSchema,
    pageResourceSchema,
    authorResourceSchema,
    tagResourceSchema,
  ])
  .describe('locatorResourceSchema')

export type LocatorResourceType = z.infer<typeof locatorResourceTypeSchema>
export type LocatorResource = z.infer<typeof locatorResourceSchema>
export type DynamicVariables = z.infer<typeof dynamicVariablesSchema>

export type LocatorResourceNode =
  | PostNodeFragment
  | PageNodeFragment
  | AuthorNodeFragment
  | TagNodeFragment

export function createLocatorResource(
  data: LocatorResourceNode,
  time: Option<number>
) {
  const { _sys: { path, relativePath, breadcrumbs } = {}, __typename: type } =
    data
  const resourceLocatorResult = createDynamicVariables(data).map(
    (dynamicVariables) => {
      const { slug } = dynamicVariables
      const nestedPath = breadcrumbs?.slice(0, -1)
      return {
        id: dynamicVariables.id,
        path,
        time,
        data,
        type: type.toLowerCase(),
        metadata: {
          ...dynamicVariables,
          relativePath,
          breadcrumbs,
          path: `/${
            nestedPath?.length ? `${nestedPath.join('/')}/` : ''
          }${slug}`,
        },
      }
    }
  )

  if (resourceLocatorResult.isErr()) {
    return err(resourceLocatorResult.error)
  }

  return parse(locatorResourceSchema, resourceLocatorResult.value)
}

export function createDynamicVariables(
  node: Partial<LocatorResourceNode>
): GspenstResult<DynamicVariables> {
  const { _sys: { filename } = {}, id } = node

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
    id,
    slug,
    year,
    month,
    day,
    primary_tag,
    primary_author,
  })
}
