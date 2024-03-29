import {
  idSchema,
  dateSchema,
  pathSchema,
  z,
  Result,
  err,
  type GspenstResult,
  type Root,
} from '../shared/kernel'
import { parse } from '../helpers/parser'
import {
  type PostNodeFragment,
  type PageNodeFragment,
} from '../.tina/__generated__/types'
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
  .describe('postSchema')

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
): GspenstResult<Post> {
  const { id, title, date, excerpt, slug } = node
  const content = node.content as Root

  const idResult = parse(idSchema, id)

  if (idResult.isErr()) {
    return err(idResult.error)
  }

  const rawTags = (node.tags ?? []).flatMap((tag) => {
    return tag?.tag ?? []
  })

  const rawAuthors = (node.authors ?? []).flatMap((author) => {
    return author?.author ?? []
  })

  const tagsResult = Result.combine(
    rawTags.map((tag) => {
      return createTag(tag, routingMapping)
    })
  )

  const authorsResult = Result.combine(
    rawAuthors.map((author) => {
      return createAuthor(author, routingMapping)
    })
  )

  return Result.combine([tagsResult, authorsResult]).andThen(
    ([tags, authors]) => {
      const primary_tag = tags[0]
      const primary_author = authors[0]
      const specialAttributes = {
        ...(primary_tag && { primary_tag }),
        ...(primary_author && { primary_author }),
        path: routingMapping[node._sys.path] ?? `/${idResult.value}`,
      }

      const { headings, titleText, hasH1 } = getHeaders(content)

      return parse(postSchema, {
        id: idResult.value,
        type: 'post',
        title: titleText ?? title,
        headings,
        hasH1,
        tags,
        authors,
        date,
        excerpt,
        slug,
        content,
        ...specialAttributes,
      })
    }
  )
}
