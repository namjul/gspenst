import path from 'path'
import * as Errors from './errors'
import {
  type AsyncReturnType,
  type ResultAsync,
  z,
  fromPromise,
  combine,
  ok,
} from './shared/kernel'
import { client } from './shared/client'
import { parse } from './helpers/parser'
import { gitDiscover } from './utils'
import {
  postTinaDataSchema,
  pageTinaDataSchema,
  authorTinaDataSchema,
  tagTinaDataSchema,
  configTinaDataSchema,
} from './domain/resource'
import {
  type PostFilter,
  type PageFilter,
  type AuthorFilter,
  type TagFilter,
  type ThemeConfigNodeFragment as ConfigResourceNode,
  getSdk,
} from './.tina/__generated__/types'

type ApiResultAsync<T> = ResultAsync<T>
type Confify<T> = T & { data: { config?: ConfigResourceNode | undefined } }
type GetConfig = AsyncReturnType<typeof sdk.getConfig>
type GetPage = Confify<AsyncReturnType<typeof sdk.getPage>>
type GetPost = Confify<AsyncReturnType<typeof sdk.getPost>>
type GetAuthor = Confify<AsyncReturnType<typeof sdk.getAuthor>>
type GetTag = Confify<AsyncReturnType<typeof sdk.getTag>>

export type Page = {
  type: 'page'
  data: GetPage
  timestamp: number | undefined
}
export type Post = {
  type: 'post'
  data: GetPost
  timestamp: number | undefined
}
export type Author = {
  type: 'author'
  data: GetAuthor
  timestamp: number | undefined
}
export type Tag = { type: 'tag'; data: GetTag; timestamp: number | undefined }
export type Config = {
  type: 'config'
  data: GetConfig
  timestamp: number | undefined
}
export type ApiEntity = Page | Post | Author | Tag | Config

const gitRepoResult = gitDiscover(process.cwd()).map((repository) => {
  // repository.path() returns the `/path/to/repo/.git`, we need the parent directory of it
  const gitRoot = path.join(repository.path(), '..')
  return { repository, gitRoot }
})

const sdk = getSdk(async (query: any, variables: any): Promise<any> => {
  /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
  const result = await client.request({ query, variables })
  return { ...result, variables }
  /* eslint-enable */
})

export const configDataSchema = z
  .object({
    data: z.object({
      config: configTinaDataSchema,
    }),
  })
  .transform(({ data: { config } }) => {
    return {
      type: 'config' as const,
      data: config,
    }
  })
  .describe('configDataSchema')

export const postDataSchema = z
  .object({
    data: z.object({
      post: postTinaDataSchema,
    }),
  })
  .transform(({ data: { post } }) => {
    return {
      type: 'post' as const,
      data: post,
    }
  })
  .describe('postDataSchema')

export const pageDataSchema = z
  .object({
    data: z.object({
      page: pageTinaDataSchema,
    }),
  })
  .transform(({ data: { page } }) => {
    return {
      type: 'page' as const,
      data: page,
    }
  })
  .describe('pageDataSchema')

export const authorDataSchema = z
  .object({
    data: z.object({
      author: authorTinaDataSchema,
    }),
  })
  .transform(({ data: { author } }) => {
    return {
      type: 'author' as const,
      data: author,
    }
  })
  .describe('authorDataSchema')

export const tagDataSchema = z
  .object({
    data: z.object({
      tag: tagTinaDataSchema,
    }),
  })

  .transform(({ data: { tag } }) => {
    return {
      type: 'tag' as const,
      data: tag,
    }
  })
  .describe('authorDataSchema')

export const postsDataSchema = z
  .object({
    data: z.object({
      postConnection: z.object({
        totalCount: z.number(),
        edges: z.array(z.object({ node: postTinaDataSchema })),
      }),
    }),
  })
  .transform(({ data }) =>
    data.postConnection.edges.map(({ node }) => ({
      type: 'post' as const,
      data: node,
    }))
  )
  .describe('postsDataSchema')

export const pagesDataSchema = z
  .object({
    data: z.object({
      pageConnection: z.object({
        totalCount: z.number(),
        edges: z.array(z.object({ node: pageTinaDataSchema })),
      }),
    }),
  })
  .transform(({ data }) =>
    data.pageConnection.edges.map(({ node }) => ({
      type: 'page' as const,
      data: node,
    }))
  )
  .describe('pagesDataSchema')

export const authorsDataSchema = z
  .object({
    data: z.object({
      authorConnection: z.object({
        totalCount: z.number(),
        edges: z.array(z.object({ node: authorTinaDataSchema })),
      }),
    }),
  })
  .transform(({ data }) =>
    data.authorConnection.edges.map(({ node }) => ({
      type: 'author' as const,
      data: node,
    }))
  )
  .describe('authorsDataSchema')

export const tagsDataSchema = z
  .object({
    data: z.object({
      tagConnection: z.object({
        totalCount: z.number(),
        edges: z.array(z.object({ node: tagTinaDataSchema })),
      }),
    }),
  })
  .transform(({ data }) =>
    data.tagConnection.edges.map(({ node }) => ({
      type: 'tag' as const,
      data: node,
    }))
  )
  .describe('tagsDataSchema')

const getTimestamp = (relativePath: string) => {
  return gitRepoResult.asyncAndThen(({ repository, gitRoot }) => {
    return fromPromise(
      new Promise<number | undefined>((resolutionFunc, rejectionFunc) => {
        repository
          .getFileLatestModifiedDateAsync(path.relative(gitRoot, relativePath))
          .then(resolutionFunc, rejectionFunc)
      }),
      (error) => {
        return Errors.other(
          '`getTimestamp`',
          error instanceof Error ? error : undefined
        )
      }
    ).orElse(() => {
      // Failed to get timestamp for this file. Silently ignore it.
      return ok(undefined)
    })
  })
}
export function getPage(variables: {
  relativePath: string
}): ApiResultAsync<Page> {
  return fromPromise(sdk.getPage(variables), (error: unknown) =>
    Errors.other('Api#getPage', error instanceof Error ? error : undefined)
  )
    .andThen((input) => parse(pageDataSchema, input))
    .andThen((page) => {
      return getTimestamp(page.data.data.page._sys.path).map((timestamp) => {
        return {
          ...page,
          timestamp,
        }
      })
    })
}

export function getPages(variables?: {
  filter?: PageFilter
}): ApiResultAsync<Page[]> {
  return fromPromise(sdk.getPages(variables), (error: unknown) =>
    Errors.other('Api#getPages', error instanceof Error ? error : undefined)
  ).andThen((input) => {
    return parse(pagesDataSchema, input).asyncAndThen((pages) => {
      return combine(
        pages.map((post) => {
          return getTimestamp(post.data.data.page._sys.path).map(
            (timestamp) => {
              return {
                ...post,
                timestamp,
              }
            }
          )
        })
      )
    })
  })
}

export function getPost(variables: {
  relativePath: string
}): ApiResultAsync<Post> {
  return fromPromise(sdk.getPost(variables), (error: unknown) =>
    Errors.other('Api#getPost', error instanceof Error ? error : undefined)
  )
    .andThen((input) => parse(postDataSchema, input))
    .andThen((page) => {
      return getTimestamp(page.data.data.post._sys.path).map((timestamp) => {
        return {
          ...page,
          timestamp,
        }
      })
    })
}

export function getPosts(variables?: {
  filter?: PostFilter
}): ApiResultAsync<Post[]> {
  return fromPromise(sdk.getPosts(variables), (error: unknown) =>
    Errors.other('Api#getPosts', error instanceof Error ? error : undefined)
  ).andThen((input) => {
    return parse(postsDataSchema, input).asyncAndThen((posts) => {
      return combine(
        posts.map((post) => {
          return getTimestamp(post.data.data.post._sys.path).map(
            (timestamp) => {
              return {
                ...post,
                timestamp,
              }
            }
          )
        })
      )
    })
  })
}

export function getAuthor(variables: {
  relativePath: string
}): ApiResultAsync<Author> {
  return fromPromise(sdk.getAuthor(variables), (error: unknown) =>
    Errors.other('Api#getAuthor', error instanceof Error ? error : undefined)
  )
    .andThen((input) => parse(authorDataSchema, input))
    .andThen((page) => {
      return getTimestamp(page.data.data.author._sys.path).map((timestamp) => {
        return {
          ...page,
          timestamp,
        }
      })
    })
}

export function getAuthors(variables?: {
  filter?: AuthorFilter
}): ApiResultAsync<Author[]> {
  return fromPromise(sdk.getAuthors(variables), (error: unknown) =>
    Errors.other('Api#getAuthors', error instanceof Error ? error : undefined)
  ).andThen((input) => {
    return parse(authorsDataSchema, input).asyncAndThen((authors) => {
      return combine(
        authors.map((post) => {
          return getTimestamp(post.data.data.author._sys.path).map(
            (timestamp) => {
              return {
                ...post,
                timestamp,
              }
            }
          )
        })
      )
    })
  })
}

export function getTag(variables: {
  relativePath: string
}): ApiResultAsync<Tag> {
  return fromPromise(sdk.getTag(variables), (error: unknown) =>
    Errors.other('Api#getTag', error instanceof Error ? error : undefined)
  )
    .andThen((input) => parse(tagDataSchema, input))
    .andThen((page) => {
      return getTimestamp(page.data.data.tag._sys.path).map((timestamp) => {
        return {
          ...page,
          timestamp,
        }
      })
    })
}

export function getTags(variables?: {
  filter?: TagFilter
}): ApiResultAsync<Tag[]> {
  return fromPromise(sdk.getTags(variables), (error: unknown) =>
    Errors.other('Api#getTags', error instanceof Error ? error : undefined)
  ).andThen((input) => {
    return parse(tagsDataSchema, input).asyncAndThen((tags) => {
      return combine(
        tags.map((post) => {
          return getTimestamp(post.data.data.tag._sys.path).map((timestamp) => {
            return {
              ...post,
              timestamp,
            }
          })
        })
      )
    })
  })
}

export function getConfig(): ApiResultAsync<Config> {
  return fromPromise(sdk.getConfig(), (error: unknown) =>
    Errors.other('Api#getConfig', error instanceof Error ? error : undefined)
  )
    .andThen((input) => {
      return parse(configDataSchema, input)
    })
    .andThen((config) => {
      return getTimestamp(config.data.data.config._sys.path).map(
        (timestamp) => {
          return {
            ...config,
            timestamp,
          }
        }
      )
    })
}
