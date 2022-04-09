import { ok, err } from 'neverthrow'
import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import * as Errors from './errors'
import type { AsyncReturnType, Result } from './types'

const client = ExperimentalGetTinaClient() // eslint-disable-line new-cap

type ApiResult<T> = Result<T>

export type GetResources = AsyncReturnType<typeof client.getResources>
export type ResourcesResult = ApiResult<GetResources>
export async function getResources(): Promise<ResourcesResult> {
  try {
    const resources = await client.getResources()
    return ok(resources)
  } catch (e: unknown) {
    return err(Errors.other('Api', e instanceof Error ? e : undefined))
  }
}

export type GetPage = AsyncReturnType<typeof client.getPage>
export type PageResult = ApiResult<GetPage>
export async function getPage(variables: {
  relativePath: string
}): Promise<PageResult> {
  try {
    const resource = await client.getPage(variables)
    return ok(resource)
  } catch (e: unknown) {
    return err(Errors.other('Api', e instanceof Error ? e : undefined))
  }
}

export type GetPost = AsyncReturnType<typeof client.getPost>
export type PostResult = ApiResult<GetPost>
export async function getPost(variables: {
  relativePath: string
}): Promise<PostResult> {
  try {
    const resource = await client.getPost(variables)
    return ok(resource)
  } catch (e: unknown) {
    return err(Errors.other('Api', e instanceof Error ? e : undefined))
  }
}

export type GetAuthor = AsyncReturnType<typeof client.getAuthor>
export type AuthorResult = ApiResult<GetAuthor>
export async function getAuthor(variables: {
  relativePath: string
}): Promise<AuthorResult> {
  try {
    const resource = await client.getAuthor(variables)
    return ok(resource)
  } catch (e: unknown) {
    return err(Errors.other('Api', e instanceof Error ? e : undefined))
  }
}

export type GetTag = AsyncReturnType<typeof client.getTag>
export type TagResult = ApiResult<GetTag>
export async function getTag(variables: {
  relativePath: string
}): Promise<TagResult> {
  try {
    const resource = await client.getTag(variables)
    return ok(resource)
  } catch (e: unknown) {
    return err(Errors.other('Api', e instanceof Error ? e : undefined))
  }
}

export type GetConfig = AsyncReturnType<typeof client.getConfig>
export type ConfigResult = ApiResult<GetConfig>
export async function getConfig(): Promise<ConfigResult> {
  try {
    const resource = await client.getConfig()
    return ok(resource)
  } catch (e: unknown) {
    return err(Errors.other('Api', e instanceof Error ? e : undefined))
  }
}
