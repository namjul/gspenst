import {
  type ID,
  type ResultAsync,
  okAsync,
  errAsync,
  combine,
} from './shared/kernel'
import { createDb } from './db'
import { type ResourceType, type Resource } from './domain/resource'
import { type RoutesConfig } from './domain/routes'
import * as Errors from './errors'
import { collect } from './collect'

export const db = createDb<Resource>('resources')

type RepoResultAsync<T> = ResultAsync<T>

type GetValue<T extends ID | ID[]> = T extends ID[]
  ? RepoResultAsync<Resource[]>
  : RepoResultAsync<Resource>

type FindAllValue<T extends ResourceType> = RepoResultAsync<
  (T extends null | undefined ? Resource : Extract<Resource, { type: T }>)[]
>

const repository = {
  collect(routesConfig: RoutesConfig = {}): RepoResultAsync<Resource[]> {
    return collect(routesConfig).andThen((resources) => this.setAll(resources))
  },

  set(resource: Resource) {
    return db.set(String(resource.id), resource)
  },

  setAll(resources: Resource[]) {
    return combine(
      resources.map((resource) => {
        return this.set(resource).map(() => {
          return resource
        })
      })
    )
  },

  get<T extends ID | ID[]>(id: T): GetValue<T> {
    const ids = [id].flat()

    const result = db
      .get(...ids.map(String))
      .map((resources) => {
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
        Object.entries(partialEntity)
          .map(([key, value]) => {
            return (
              String(resource[key as keyof Partial<Resource>]) === String(value)
            )
          })
          .every(Boolean)
      )
    }
  },
}

type Repository = typeof repository

export type { Repository }

export default repository
