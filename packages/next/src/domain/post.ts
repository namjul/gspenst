import { idSchema, ok, err, z, combine } from '../shared-kernel'
import * as Errors from '../errors'
import type { Get, Result } from '../shared-kernel'
import type { GetPost } from '../api'
import type { Post as PostGenerated } from '../../.tina/__generated__/types'
import { authorSchema, createAuthor } from './author'
import { tagSchema, createTag } from './tag'

export const postSchema = z
  .object({
    id: idSchema,
    date: z.date(),
    slug: z.string(),
    title: z.string(),
    excerpt: z.custom().optional(),
    content: z.custom(),
    tags: z.array(tagSchema),
    primary_tag: tagSchema.optional(),
    authors: z.array(authorSchema),
    primary_author: authorSchema.optional(),
  })
  .strict()

type Post = z.infer<typeof postSchema>

export type { Post, GetPost, PostGenerated }

export function createPost({
  id,
  __typename,
  tags: rawTags,
  authors: rawAuthors,
  date,
  ...restPostProps
}: Get<GetPost, 'data.post'>): Result<Post> {
  const tagsResult = combine(
    (rawTags ?? []).flatMap((tag) => {
      if (tag?.tag) {
        return createTag(tag.tag)
      }
      return []
    })
  )

  const authorsResult = combine(
    (rawAuthors ?? []).flatMap((author) => {
      if (author?.author) {
        return createAuthor(author.author)
      }
      return []
    })
  )

  return combine([tagsResult, authorsResult]).andThen(([tags, authors]) => {
    const post = {
      id,
      ...restPostProps,
      date: new Date(date),
      tags,
      authors,
      primary_tag: tags?.[0],
      primary_author: authors?.[0],
    }

    const parsedPostResult = postSchema.safeParse(post)
    if (parsedPostResult.success) {
      return ok(parsedPostResult.data)
    } else {
      return err(Errors.other('Create Post', parsedPostResult.error))
    }
  })
}
