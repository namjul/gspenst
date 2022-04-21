import { z } from 'zod'
import { ok, err } from 'neverthrow'
import * as Errors from '../errors'
import type { Get, Result } from '../types'
import type { GetPost } from '../api'
import type { Post as PostGenerated } from '../../.tina/__generated__/types'
import { authorSchema, convert as convertAuthor } from './author'
import { tagSchema, convert as convertTag } from './tag'

export const getPostSchema = z.custom<GetPost>(value => value)

export const resourceType = z.literal('post')

export const postSchema = z
  .object({
    id: z.string(), // TODO z.uuid()
    date: z.string(),
    slug: z.string(),
    title: z.string(),
    excerpt: z.string().optional(),
    content: z.string(),
    tags: z.array(tagSchema),
    authors: z.array(authorSchema),
  })
  .strict()

type Post = z.infer<typeof postSchema>

export type { Post, GetPost, PostGenerated }

export function convert(
  getPostDocument: Get<GetPost, 'data.getPostDocument'>
): Result<Post> {
  const {
    id,
    data: { __typename, tags, authors, ...restPostProps },
  } = getPostDocument

  const post = {
    id,
    ...restPostProps,
    tags: (tags ?? []).flatMap((tag) => {
      return tag?.tag ? convertTag(tag.tag) : []
    }),
    authors: (authors ?? []).flatMap((author) => {
      return author?.author ? convertAuthor(author.author) : []
    }),
  }

  const parsedPostResult = postSchema.safeParse(post)
  if (parsedPostResult.success) {
    return ok(parsedPostResult.data)
  } else {
    return err(Errors.other('Convert Post', parsedPostResult.error))
  }
}
