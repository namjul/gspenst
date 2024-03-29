import {
  type ID,
  type GspenstResultAsync,
  okAsync,
  errAsync,
  ResultAsync,
} from './shared/kernel'
import { createDb } from './db'
import { type ResourceType, type Resource } from './domain/resource'
import { type RoutesConfigInput } from './domain/routes'
import * as Errors from './errors'
import { collect } from './collect'
import { objectMatch } from './shared/utils'

export const db = createDb<Resource>('resources')

type RepoResultAsync<T> = GspenstResultAsync<T>

type GetValue<T extends ID | ID[]> = T extends ID[]
  ? RepoResultAsync<Resource[]>
  : RepoResultAsync<Resource>

type FindAllValue<T extends ResourceType> = RepoResultAsync<
  (T extends null | undefined ? Resource : Extract<Resource, { type: T }>)[]
>

type Func = (data: unknown) => void
const observers: Array<Func> = []
const observer = Object.freeze({
  notify: (data: unknown) => observers.forEach((_observer) => _observer(data)),
  subscribe: (func: Func) => observers.push(func),
  unsubscribe: (func: Func) => {
    ;[...observers].forEach((_observer, index) => {
      if (_observer === func) {
        observers.splice(index, 1)
      }
    })
  },
})

const repository = Object.freeze({
  ...observer,

  collect(routesConfig?: RoutesConfigInput): RepoResultAsync<Resource[]> {
    return collect(routesConfig).andThen((resources) => this.setAll(resources))
  },

  set(resource: Resource) {
    return db.set(String(resource.id), resource).map((result) => {
      this.notify(result)
      return result
    })
  },

  setAll(resources: Resource[]) {
    return ResultAsync.combine(
      resources.map((resource) => {
        return this.set(resource).map(() => {
          return resource
        })
      })
    )
  },

  get<T extends ID | ID[]>(id: T): GetValue<T> {
    const ids = [id].flat()

    const result = db.get(...ids.map(String)).map((resources) => {
      if (ids.length === 1) {
        return resources[0]
      }
      return resources
    })

    return result as GetValue<T>
  },

  getAll() {
    return db.keys().andThen((ids) => {
      return this.get(ids as unknown as ID[])
    })
  },

  find(partialResourceItem: Partial<Resource>) {
    return this.getAll().andThen((resources) => {
      const found = resources.find(this.match(partialResourceItem))
      return found
        ? okAsync(found)
        : errAsync(
            Errors.notFound(
              `Repo#find: ${JSON.stringify(partialResourceItem, null, 2)}`
            )
          )
    })
  },

  findAll<T extends ResourceType>(type?: T): FindAllValue<T> {
    return this.getAll().andThen((resources) => {
      if (type) {
        const found = Object.values(resources).filter(this.match({ type }))
        return okAsync(found) as FindAllValue<T>
      }
      return okAsync(resources) as FindAllValue<T>
    })
  },

  match(partialEntity: Partial<Resource>) {
    return (resource: Resource) => {
      const isResource = 'type' in partialEntity && 'type' in resource
      return (
        (isResource ? partialEntity.type === resource.type : true) &&
        objectMatch(partialEntity, resource)
      )
    }
  },
})

type Repository = typeof repository

export type { Repository }

export default repository
