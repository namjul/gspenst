import { ok, err } from 'neverthrow'
import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import * as Errors from './errors'
import type { AsyncReturnType, Result } from './types'

const client = ExperimentalGetTinaClient() // eslint-disable-line new-cap

type ApiResult<T> = Result<T>

export async function getResources() {
  try {
    const resources = await client.getResources()
    return ok(resources)
  } catch (e: unknown) {
    return err(new Error(String(e)))
  }
}

export type GetPage = AsyncReturnType<typeof client.getPage> | undefined
export type PageResult = ApiResult<GetPage>
export async function getPage(variables: {
  relativePath: string
}): Promise<PageResult> {
  try {
    const resources = await client.getPage(variables)
    return ok(resources)
  } catch (e: unknown) {
    return err(Errors.other('Api', e instanceof Error ? e : undefined))
  }
}

export type GetPost = AsyncReturnType<typeof client.getPost> | undefined
export type PostResult = ApiResult<GetPost>
export async function getPost(variables: {
  relativePath: string
}): Promise<PostResult> {
  try {
    const resources = await client.getPost(variables)
    return ok(resources)
  } catch (e: unknown) {
    return err(Errors.other('Api', e instanceof Error ? e : undefined))
  }
}

export type GetAuthor = AsyncReturnType<typeof client.getAuthor> | undefined
export type AuthorResult = ApiResult<GetAuthor>
export async function getAuthor(variables: {
  relativePath: string
}): Promise<AuthorResult> {
  try {
    const resources = await client.getAuthor(variables)
    return ok(resources)
  } catch (e: unknown) {
    return err(Errors.other('Api', e instanceof Error ? e : undefined))
  }
}

export type GetTag = AsyncReturnType<typeof client.getTag> | undefined
export type TagResult = ApiResult<GetTag>
export async function getTag(variables: {
  relativePath: string
}): Promise<TagResult> {
  try {
    const resources = await client.getTag(variables)
    return ok(resources)
  } catch (e: unknown) {
    return err(Errors.other('Api', e instanceof Error ? e : undefined))
  }
}

export type GetConfig =
  | AsyncReturnType<typeof client.getConfigDocument>
  | undefined
export type ConfigResult = ApiResult<GetConfig>
export async function getConfigDocument(variables: {
  relativePath: string
}): Promise<ConfigResult> {
  try {
    const resources = await client.getConfigDocument(variables)
    return ok(resources)
  } catch (e: unknown) {
    return err(Errors.other('Api', e instanceof Error ? e : undefined))
  }
}
