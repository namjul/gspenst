import { fromPromise } from './shared-kernel'
import redis from './redis'

import type { ResultAsync } from './shared-kernel'
import * as Errors from './errors'

type DBResultAsync<T> = ResultAsync<T>

type AObject =
  | {
      [index: number]: any
    }
  | Record<string, any>

const db = {
  clear(): DBResultAsync<'OK'> {
    return fromPromise(redis.flushall(), (error: unknown) =>
      Errors.other('Db', error instanceof Error ? error : undefined)
    )
  },
  set<T extends AObject>(
    key: string,
    field: string,
    value: T
  ): DBResultAsync<number> {
    return fromPromise(
      redis.hset(key, field, JSON.stringify(value)),
      (error: unknown) =>
        Errors.other('Db', error instanceof Error ? error : undefined)
    )
  },
  get<T extends AObject>(key: string, ...fields: string[]): DBResultAsync<T[]> {
    return fromPromise(
      (async () => {
        const result = fields.length ? await redis.hmget(key, ...fields) : []
        const foundIndex = result.findIndex((y) => y === null)
        if (foundIndex >= 0) {
          throw new Error(`Db: ${fields[foundIndex]} is \`null\``)
        }
        return result.map((value) => JSON.parse(value!)) as T[]
      })(),
      (error: unknown) =>
        Errors.other(
          `Db: ${key} ${fields}`,
          error instanceof Error ? error : undefined
        )
    )
  },
  getAll<T extends AObject>(key: string): DBResultAsync<T[]> {
    return fromPromise(
      (async () => {
        const result = await redis.hgetall(key)
        return Object.values(result).map((value) => JSON.parse(value)) as T[]
      })(),
      (error: unknown) =>
        Errors.other('Db', error instanceof Error ? error : undefined)
    )
  },
  keys(key: string): DBResultAsync<string[]> {
    return fromPromise(redis.hkeys(key), (error: unknown) =>
      Errors.other('Db', error instanceof Error ? error : undefined)
    )
  },
}

type DB = typeof db

export type { DB }

export default db
