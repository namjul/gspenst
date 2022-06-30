import { idSchema, dateSchema, pathSchema, z, combine } from '../shared/kernel'
import type { Result } from '../shared/kernel'
import { isNumber } from '../shared/utils'
import { parse } from '../helpers/parser'
import { authorSchema, createAuthor } from './author'
import { tagSchema, createTag } from './tag'
import type {
  PostResource,
  PageResource,
  TagResource,
  AuthorResource,
} from './resource'

export const postSchema = z
  .object({
    id: idSchema,
    type: z.literal('post'),
    date: dateSchema,
    slug: z.string(),
    title: z.string(),
    excerpt: z.custom().optional(),
    content: z.custom(),
    path: pathSchema,
    primary_tag: tagSchema.optional(),
    primary_author: authorSchema.optional(),
    tags: z.array(tagSchema),
    authors: z.array(authorSchema),
  })
  .strict()

postSchema.describe('postSchema')

export type Post = z.infer<typeof postSchema>

export const postNormalizedSchema = postSchema.merge(
  z.object({
    tags: z.array(idSchema),
    authors: z.array(idSchema),
  })
)

export type PostNormalized = z.infer<typeof postNormalizedSchema>

export function createPost(
  resource: PostResource | PageResource
): Result<Post> {
  const { tinaData, relationships, path, resourceType } = resource

  const { __typename, _sys, ...post } =
    resourceType === 'post' ? tinaData.data.post : tinaData.data.page

  const rawTags = (post.tags ?? []).flatMap((tag) => {
    return tag?.tag ?? []
  })

  const rawAuthors = (post.authors ?? []).flatMap((author) => {
    return author?.author ?? []
  })

  const tagResources = relationships.filter(
    (_resource): _resource is TagResource =>
      !isNumber(_resource) && _resource.resourceType === 'tag'
  )
  const authorResources = relationships.filter(
    (_resource): _resource is AuthorResource =>
      !isNumber(_resource) && _resource.resourceType === 'author'
  )

  const tagsResult = combine(
    tagResources.map((tagResource, index) => {
      tagResource.tinaData.data.tag = rawTags[index]!
      return createTag(tagResource)
    })
  )

  const authorsResult = combine(
    authorResources.map((authorResource, index) => {
      authorResource.tinaData.data.author = rawAuthors[index]!
      return createAuthor(authorResource)
    })
  )

  return combine([tagsResult, authorsResult]).andThen(([tags, authors]) => {
    const primary_tag = tags?.[0]
    const primary_author = authors?.[0]
    const specialAttributes = {
      ...(primary_tag && { primary_tag }),
      ...(primary_author && { primary_author }),
      path: path ?? `/${resource.id}`,
    }

    return parse(postSchema, {
      type: 'post',
      ...post,
      tags,
      authors,
      ...specialAttributes,
    })
  })
}
