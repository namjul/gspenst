import { okAsync, errAsync, combine } from './shared-kernel'
import { resourcesDb as db } from './db'
import type { ResourceType, Resource } from './domain/resource'
import type { RoutesConfig } from './domain/routes'
import type { ID, ResultAsync } from './shared-kernel'
import * as Errors from './errors'
import { collect } from './collect'

type RepoResultAsync<T> = ResultAsync<T>

type GetValue<T extends ID | ID[]> = T extends ID[]
  ? RepoResultAsync<Resource[]>
  : RepoResultAsync<Resource>

type FindAllValue<T extends ResourceType> = RepoResultAsync<
  (T extends null | undefined
    ? Resource
    : Extract<Resource, { resourceType: T }>)[]
>

const repository = {
  collect(routesConfig: RoutesConfig = {}): RepoResultAsync<Resource[]> {
    return collect(routesConfig).andThen((resources) => {
      const p = resources.map((resource) => {
        return this.set(resource).map(() => {
          return resource
        })
      })
      return combine(p)
    })
  },

  set(resource: Resource) {
    return combine([db.set(String(resource.id), resource), db.set('meta', { updated_at: (new Date()).getTime() })])
  },

  sinceLastUpdate(date: Date) {
    return db.get('meta').andThen(resources => {
      if (resources.length !== 1) {
        return errAsync(Errors.other('sinceLastUpdate: there should be only a single meta entry'))
      } else {
        const resourcesMetaData = resources[0]
        if (resourcesMetaData && 'updated_at' in resourcesMetaData) {
          return okAsync(date.getTime() - Number(resourcesMetaData.updated_at))
        }
         return errAsync(
            Errors.notFound(
              `Repo#sinceLastUpdate`
            )
          )
      }
    })
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
    return db.keys().andThen((idsResult) => {
      return this.get(idsResult as unknown as ID[])
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

  findAll<T extends ResourceType>(resourceType?: T): FindAllValue<T> {
    return this.getAll().andThen((resources) => {
      if (resourceType) {
        const found = Object.values(resources).filter(
          this.match({ resourceType })
        )
        return okAsync(found) as FindAllValue<T>
      }
      return okAsync(resources) as FindAllValue<T>
    })
  },

  match<T extends Resource>(partialResourceItem: Partial<T>) {
    return (resource: T) =>
      (partialResourceItem.resourceType
        ? partialResourceItem.resourceType === resource.resourceType
        : true) &&
      Object.entries(partialResourceItem)
        .map(([key, value]) => {
          return String(resource[key as keyof Partial<T>]) === String(value)
        })
        .every(Boolean)
  },
}

type Repository = typeof repository

export type { Repository }

export default repository
