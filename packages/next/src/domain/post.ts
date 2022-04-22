import { idSchema, ok, err, z } from '../shared-kernel'
import * as Errors from '../errors'
import type { Get, Result } from '../shared-kernel'
import type { GetPost } from '../api'
import type { Post as PostGenerated } from '../../.tina/__generated__/types'
import { authorSchema, createAuthor } from './author'
import { tagSchema, createTag } from './tag'

export const getPostSchema = z.custom<GetPost>((value) => value)

export const resourceType = z.literal('post')

export const postSchema = z
  .object({
    id: idSchema,
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

export function createPost(
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
      return tag?.tag ? createTag(tag.tag) : []
    }),
    authors: (authors ?? []).flatMap((author) => {
      return author?.author ? createAuthor(author.author) : []
    }),
  }

  const parsedPostResult = postSchema.safeParse(post)
  if (parsedPostResult.success) {
    return ok(parsedPostResult.data)
  } else {
    return err(Errors.other('Convert Post', parsedPostResult.error))
  }
}
