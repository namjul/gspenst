import { ResultAsync as ResultAsyncInternal } from 'neverthrow'
import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import * as Errors from './errors'
import type { AsyncReturnType, ResultAsync } from './types'

const client = ExperimentalGetTinaClient() // eslint-disable-line new-cap

type ApiResultAsync<T> = ResultAsync<T>

export type GetResources = AsyncReturnType<typeof client.getResources>
export type ResourcesResult = ReturnType<typeof getResources>
export function getResources(): ApiResultAsync<GetResources> {
  return ResultAsyncInternal.fromPromise(
    client.getResources(),
    (error: unknown) =>
      Errors.other('Api', error instanceof Error ? error : undefined)
  )
}

export type GetPage = AsyncReturnType<typeof client.getPage>
export type PageResult = ReturnType<typeof getPage>
export function getPage(variables: {
  relativePath: string
}): ApiResultAsync<GetPage> {
  return ResultAsyncInternal.fromPromise(
    client.getPage(variables),
    (error: unknown) =>
      Errors.other('Api', error instanceof Error ? error : undefined)
  )
}

export type GetPost = AsyncReturnType<typeof client.getPost>
export type PostResult = ReturnType<typeof getPost>
export function getPost(variables: {
  relativePath: string
}): ApiResultAsync<GetPost> {
  return ResultAsyncInternal.fromPromise(
    client.getPost(variables),
    (error: unknown) =>
      Errors.other('Api', error instanceof Error ? error : undefined)
  )
}

export type GetAuthor = AsyncReturnType<typeof client.getAuthor>
export type AuthorResult = ReturnType<typeof getAuthor>
export function getAuthor(variables: {
  relativePath: string
}): ApiResultAsync<GetAuthor> {
  return ResultAsyncInternal.fromPromise(
    client.getAuthor(variables),
    (error: unknown) =>
      Errors.other('Api', error instanceof Error ? error : undefined)
  )
}

export type GetTag = AsyncReturnType<typeof client.getTag>
export type TagResult = ReturnType<typeof getTag>
export function getTag(variables: {
  relativePath: string
}): ApiResultAsync<GetTag> {
  return ResultAsyncInternal.fromPromise(
    client.getTag(variables),
    (error: unknown) =>
      Errors.other('Api', error instanceof Error ? error : undefined)
  )
}

export type GetConfig = AsyncReturnType<typeof client.getConfig>
export type ConfigResult = ReturnType<typeof getConfig>
export function getConfig(): ApiResultAsync<GetConfig> {
  return ResultAsyncInternal.fromPromise(client.getConfig(), (error: unknown) =>
    Errors.other('Api', error instanceof Error ? error : undefined)
  )
}
