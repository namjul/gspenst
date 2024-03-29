import { type GspenstResultAsync, fromPromise } from './shared/kernel'
import redis from './redis'
import * as Errors from './errors'

type DBResultAsync<T> = GspenstResultAsync<T>

export function clear(): DBResultAsync<'OK'> {
  return fromPromise(redis.flushall(), (error: unknown) =>
    Errors.other('Db', error instanceof Error ? error : undefined)
  )
}

export function createDb<T extends object>(key: string) {
  const db = {
    subscribe(): DBResultAsync<unknown> {
      return fromPromise(redis.subscribe(key), (error: unknown) =>
        Errors.other('Db', error instanceof Error ? error : undefined)
      )
    },

    delete(): DBResultAsync<number> {
      return fromPromise(redis.del(key), (error: unknown) =>
        Errors.other('Db', error instanceof Error ? error : undefined)
      )
    },
    set(field: string, value: T): DBResultAsync<number> {
      return fromPromise(
        redis.hset(key, field, JSON.stringify(value)),
        (error: unknown) =>
          Errors.other('Db', error instanceof Error ? error : undefined)
      )
    },
    get(...fields: string[]): DBResultAsync<T[]> {
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
    getAll(): DBResultAsync<T[]> {
      return fromPromise(
        (async () => {
          const result = await redis.hgetall(key)
          return Object.values(result).map((value) => JSON.parse(value)) as T[]
        })(),
        (error: unknown) =>
          Errors.other('Db', error instanceof Error ? error : undefined)
      )
    },
    keys(): DBResultAsync<string[]> {
      return fromPromise(redis.hkeys(key), (error: unknown) =>
        Errors.other('Db', error instanceof Error ? error : undefined)
      )
    },
  }
  return db
}
