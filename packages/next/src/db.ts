import { fromPromise } from './shared-kernel'
import redis from './redis'
import type { ResourceData } from './domain/theming'
import type { Resource } from './domain/resource'
import type { ResultAsync } from './shared-kernel'
import * as Errors from './errors'

type DBResultAsync<T> = ResultAsync<T>

type AObject =
  | {
      [index: number]: any
    }
  | Record<string, any>

export function clear(): DBResultAsync<'OK'> {
  return fromPromise(redis.flushall(), (error: unknown) =>
    Errors.other('Db', error instanceof Error ? error : undefined)
  )
}

export function createDb<T extends AObject>(key: string) {
  const db = {
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

export const resourcesDb = createDb<Resource>('resources')
export const resourcesDataDb = createDb<ResourceData>('resourcesData')
