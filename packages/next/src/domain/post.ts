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

export function createPost(
  getPostDocument: Get<GetPost, 'data.getPostDocument'>
): Result<Post> {
  const {
    id,
    data: { __typename, tags: rawTags, authors: rawAuthors, ...restPostProps },
  } = getPostDocument

  const tags = (rawTags ?? []).flatMap((tag) => {
    if (tag?.tag) {
      const tagResult = createTag(tag.tag)
      if (tagResult.isOk()) {
        return tagResult.value
      }
    }
    return []
  })

  const authors = (rawAuthors ?? []).flatMap((author) => {
    if (author?.author) {
      const authorResult = createAuthor(author.author)
      if (authorResult.isOk()) {
        return authorResult.value
      }
    }
    return []
  })

  const post = {
    id,
    ...restPostProps,
    tags,
    authors,
    primary_tag: tags[0],
    primary_author: authors[0],
  }

  const parsedPostResult = postSchema.safeParse(post)
  if (parsedPostResult.success) {
    return ok(parsedPostResult.data)
  } else {
    return err(Errors.other('Create Post', parsedPostResult.error))
  }
}
