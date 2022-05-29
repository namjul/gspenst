import { getSdk } from '../.tina/__generated__/types'
// import type { PageFilter, PostFilter, AuthorFilter, TagFilter } from '../.tina/__generated__/types'
import { fromPromise } from './shared-kernel'
import * as Errors from './errors'
import type { AsyncReturnType, ResultAsync } from './shared-kernel'
import { client } from './shared/client'

const sdk = getSdk(async (query: any, variables: any): Promise<any> => {
  /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
  const result = await client.request({ query, variables })
  return { ...result, variables }
  /* eslint-enable */
})

type ApiResultAsync<T> = ResultAsync<T>

export type GetResources = AsyncReturnType<typeof sdk.getResources>
export function getResources(): ApiResultAsync<GetResources> {
  return fromPromise(sdk.getResources(), (error: unknown) =>
    Errors.other('Api#getResources', error instanceof Error ? error : undefined)
  )
}

export type GetPage = AsyncReturnType<typeof sdk.getPage>
export function getPage(variables: {
  relativePath: string
}): ApiResultAsync<GetPage> {
  return fromPromise(sdk.getPage(variables), (error: unknown) =>
    Errors.other('Api#getPage', error instanceof Error ? error : undefined)
  )
}

// export type GetPages = AsyncReturnType<typeof sdk.getPages>
// export function getPages(variables: {
//   filter: PageFilter
// }): ApiResultAsync<GetPages> {
//   return fromPromise(sdk.getPages(variables), (error: unknown) =>
//     Errors.other('Api#getPages', error instanceof Error ? error : undefined)
//   )
// }

export type GetPost = AsyncReturnType<typeof sdk.getPost>
export function getPost(variables: {
  relativePath: string
}): ApiResultAsync<GetPost> {
  return fromPromise(sdk.getPost(variables), (error: unknown) =>
    Errors.other('Api#getPost', error instanceof Error ? error : undefined)
  )
}

// export type GetPosts = AsyncReturnType<typeof sdk.getPosts>
// export function getPosts(variables: {
//   filter: PostFilter
// }): ApiResultAsync<GetPosts> {
//   return fromPromise(sdk.getPosts(variables), (error: unknown) =>
//     Errors.other('Api#getPosts', error instanceof Error ? error : undefined)
//   )
// }

export type GetAuthor = AsyncReturnType<typeof sdk.getAuthor>
export function getAuthor(variables: {
  relativePath: string
}): ApiResultAsync<GetAuthor> {
  return fromPromise(sdk.getAuthor(variables), (error: unknown) =>
    Errors.other('Api#getAuthor', error instanceof Error ? error : undefined)
  )
}

// export type GetAuthors = AsyncReturnType<typeof sdk.getAuthors>
// export function getAuthors(variables: {
//   filter: AuthorFilter
// }): ApiResultAsync<GetAuthors> {
//   return fromPromise(sdk.getAuthors(variables), (error: unknown) =>
//     Errors.other('Api#getAuthors', error instanceof Error ? error : undefined)
//   )
// }

export type GetTag = AsyncReturnType<typeof sdk.getTag>
export function getTag(variables: {
  relativePath: string
}): ApiResultAsync<GetTag> {
  return fromPromise(sdk.getTag(variables), (error: unknown) =>
    Errors.other('Api#getTag', error instanceof Error ? error : undefined)
  )
}

// export type GetTags = AsyncReturnType<typeof sdk.getTags>
// export function getTags(variables: {
//   filter: AuthorFilter
// }): ApiResultAsync<GetTags> {
//   return fromPromise(sdk.getTags(variables), (error: unknown) =>
//     Errors.other('Api#getTags', error instanceof Error ? error : undefined)
//   )
// }

export type GetConfig = AsyncReturnType<typeof sdk.getConfig>
export function getConfig(): ApiResultAsync<GetConfig> {
  return fromPromise(sdk.getConfig(), (error: unknown) =>
    Errors.other('Api#getConfig', error instanceof Error ? error : undefined)
  )
}
