import { ResultAsync as ResultAsyncInternal } from 'neverthrow'
import redis from './redis'

import type { ResultAsync } from './types'
import * as Errors from './errors'

type DBResultAsync<T> = ResultAsync<T>

const db = {
  clear(): DBResultAsync<'OK'> {
    return ResultAsyncInternal.fromPromise(redis.flushall(), (error: unknown) =>
      Errors.other('Db', error instanceof Error ? error : undefined)
    )
  },
  set(key: string, field: string, value: string): DBResultAsync<number> {
    return ResultAsyncInternal.fromPromise(
      redis.hset(key, field, value),
      (error: unknown) =>
        Errors.other('Db', error instanceof Error ? error : undefined)
    )
  },
  get(key: string, ...fields: string[]): DBResultAsync<(string | null)[]> {
    return ResultAsyncInternal.fromPromise(
      redis.hmget(key, ...fields),
      (error: unknown) =>
        Errors.other('Db', error instanceof Error ? error : undefined)
    )
  },
  keys(key: string): DBResultAsync<string[]> {
    return ResultAsyncInternal.fromPromise(
      redis.hkeys(key),
      (error: unknown) =>
        Errors.other('Db', error instanceof Error ? error : undefined)
    )
  },
}

type DB = typeof db

export type { DB }

export default db
