import {
  idSchema,
  dateSchema,
  pathSchema,
  z,
  combine,
  err,
  type Result,
  type Root,
} from '../shared/kernel'
import { parse } from '../helpers/parser'
import {
  type PostNodeFragment,
  type PageNodeFragment,
} from '../../.tina/__generated__/types'
import { type RoutingMapping } from '../helpers/getPageMap'
import { getHeaders } from '../helpers/getHeaders'
import { authorSchema, createAuthor } from './author'
import { tagSchema, createTag } from './tag'

export const postSchema = z
  .object({
    id: idSchema,
    type: z.literal('post'),
    date: dateSchema,
    slug: z.string(),
    title: z.string().nullable(),
    excerpt: z.string().nullable(),
    content: z.custom<Root>(), // TODO define zod parser for content
    headings: z.array(
      z.object({ value: z.string(), type: z.string(), children: z.custom() })
    ),
    hasH1: z.boolean(),
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

postNormalizedSchema.describe('postNormalizedSchema')

export type PostNormalized = z.infer<typeof postNormalizedSchema>

export function createPost(
  node: PostNodeFragment | PageNodeFragment,
  routingMapping: RoutingMapping = {}
): Result<Post> {
  const { __typename, _sys, id, ...post } = node

  const idResult = parse(idSchema, node.id)

  if (idResult.isErr()) {
    return err(idResult.error)
  }

  const rawTags = (post.tags ?? []).flatMap((tag) => {
    return tag?.tag ?? []
  })

  const rawAuthors = (post.authors ?? []).flatMap((author) => {
    return author?.author ?? []
  })

  const tagsResult = combine(
    rawTags.map((tag) => {
      return createTag(tag, routingMapping)
    })
  )

  const authorsResult = combine(
    rawAuthors.map((author) => {
      return createAuthor(author, routingMapping)
    })
  )

  return combine([tagsResult, authorsResult]).andThen(([tags, authors]) => {
    const primary_tag = tags?.[0]
    const primary_author = authors?.[0]
    const specialAttributes = {
      ...(primary_tag && { primary_tag }),
      ...(primary_author && { primary_author }),
      path: routingMapping[node._sys.path] ?? `/${idResult.value}`,
    }

    const { headings, titleText, hasH1 } = getHeaders(post.content as Root)

    return parse(postSchema, {
      id: idResult.value,
      type: 'post',
      ...post,
      title: titleText ?? post.title,
      headings,
      hasH1,
      tags,
      authors,
      ...specialAttributes,
    })
  })
}
