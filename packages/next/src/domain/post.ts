import { idSchema, dateSchema, urlSchema, z, combine } from '../shared-kernel'
import type { Result } from '../shared-kernel'
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
    date: dateSchema,
    slug: z.string(),
    title: z.string(),
    excerpt: z.custom().optional(),
    content: z.custom(),
    url: urlSchema,
    tags: z.array(tagSchema),
    primary_tag: tagSchema.optional(),
    authors: z.array(authorSchema),
    primary_author: authorSchema.optional(),
    page: z.boolean().default(false),
  })
  .strict()

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
  const { tinaData, relationships, urlPathname, resourceType } = resource

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
    const specialAttributes = {
      primary_tag: tags?.[0],
      primary_author: authors?.[0],
      url: urlPathname ?? `/${resource.id}`,
    }

    return parse(postSchema, {
      ...post,
      tags,
      authors,
      ...specialAttributes,
    })
  })
}
