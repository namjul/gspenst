import { idSchema, dateSchema, ok, err, z, combine } from '../shared-kernel'
import * as Errors from '../errors'
import type { Result } from '../shared-kernel'
import type {
  PostFragmentFragment,
  PageFragmentFragment,
} from '../../.tina/__generated__/types'
import { authorSchema, createAuthor } from './author'
import { tagSchema, createTag } from './tag'

export const postSchema = z
  .object({
    id: idSchema,
    date: dateSchema,
    slug: z.string(),
    title: z.string(),
    excerpt: z.custom().optional(),
    content: z.custom(),
    tags: z.array(tagSchema),
    primary_tag: tagSchema.optional(),
    authors: z.array(authorSchema),
    primary_author: authorSchema.optional(),
    page: z.boolean().default(false),
  })
  .strict()

export type Post = z.infer<typeof postSchema>

// TODO add Post type with special attributes https://ghost.org/docs/themes/contexts/post/
//https://www.typescriptlang.org/play?exactOptionalPropertyTypes=true#code/KYDwDg9gTgLgBDAnmYcByBDAtqgvHAbzgDttgAuOAZxigEtiBzOAXwChRJYFlUBJACZx8ROgMrEArlgBGwKKw7ho8JCjgA1DABtJwADwAVOKBjBiAqnADyYGHQjF9NekwB8b4XGOnzluJIWwABmDMBCAPzoZHCUgmxKXKq8NnYOToae+MYAPgFBocThCYkqcMGBAMb2jnCVUMAYZkYmIGYWVrY1Ti4MjFn5AiFhAm4AFAJNGOS9TAA0cABuOnoRlIYAlJRaugaZhGxwR3B0wXBjasAQZ8u7wrj4AOSzjI8bcA0wklDEhCRklFuelYcAwVh2eiMbgSxzqjioEG0wAAdNoIIwxkDgBtDsdPt9fqJxHAAIwAJgAzCCwZoVntoew2JV4fAQF56o0zGNHpMYBhHgtngJgm8mSy4Ih2Q0msBubz+QtAkNCuEccziDQ4AAvKWc2U8qZvIA
export function createPost(
  postData: PostFragmentFragment | PageFragmentFragment
): Result<Post> {
  const {
    __typename,
    _sys,
    tags: rawTags,
    authors: rawAuthors,
    ...restPostProps
  } = postData

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
      ...restPostProps,
      tags,
      authors,
      primary_tag: tags?.[0],
      primary_author: authors?.[0],
      page: __typename === 'Page'
    }

    const parsedPostResult = postSchema.safeParse(post)
    if (parsedPostResult.success) {
      return ok(parsedPostResult.data)
    } else {
      return err(Errors.other('Create Post', parsedPostResult.error))
    }
  })
}
