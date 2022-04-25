import { okAsync, errAsync, combine } from './shared-kernel'
import * as api from './api'
import db from './db'
import { absurd } from './utils'
import type { ResourceType, Resource } from './domain/resource'
import { createResource } from './domain/resource'
import type { ID, ResultAsync } from './shared-kernel'
import * as Errors from './errors'

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
  collect() {
    // void (await this.getAll()) // TODO describe why doing this here
    return combine([db.clear(), api.getResources()]).andThen((values) => {
      const result = combine(
        values.flatMap((value) => {
          if (value === 'OK') {
            return []
          } else {
            const e = value.data.getCollections.flatMap((collection) => {
              return (collection.documents.edges ?? []).flatMap(
                (connectionEdge) => {
                  if (connectionEdge?.node) {
                    const { node } = connectionEdge
                    if (node.__typename === 'ConfigDocument') {
                      return []
                    } else {
                      const resourceResult = createResource(node)
                      if (resourceResult.isOk()) {
                        return this.set(resourceResult.value).map(
                          () => resourceResult
                        )
                      }
                      return errAsync(resourceResult.error)
                    }
                  }
                  return errAsync(Errors.other('Should not happen'))
                }
              )
            })
            return e
          }
        })
      )

      return result
    })
  },
  set(resource: Resource) {
    return db.set<Resource>('resources', String(resource.id), resource)
  },

  get<T extends ID | ID[]>(id: T): GetValue<T> {
    const ids = [id].flat()

    const result = db
      .get<Resource>('resources', ...ids.map(String))
      .andThen((resources) => {
        const resourcesResultList = resources.map((resource) => {
          if (resource.tinaData) {
            return okAsync(resource)
          } else {
            const tinaDataResult = (() => {
              const { resourceType, relativePath } = resource
              switch (resourceType) {
                case 'page':
                  return api.getPage({ relativePath })
                case 'post':
                  return api.getPost({ relativePath })
                case 'author':
                  return api.getAuthor({ relativePath })
                case 'tag':
                  return api.getTag({ relativePath })
                default:
                  return absurd(resourceType)
              }
            })() // Immediately invoke the function

            return tinaDataResult
              .map((tinaData) => {
                resource.tinaData = tinaData
                return this.set(resource).andThen(() => okAsync(resource))
              })
              .andThen((resourceResult) => resourceResult)
          }
        })

        return combine(resourcesResultList)
      })
      .map((resources) => {
        if (ids.length === 1) {
          return resources[0]
        }
        return resources
      })

    return result as GetValue<T>
  },

  getAll() {
    return db.keys('resources').andThen((idsResult) => {
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
              `Repo: ${JSON.stringify(partialResourceItem, null, 2)}`
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
          return (
            String(resource[key as keyof typeof partialResourceItem]) ===
            String(value)
          )
        })
        .every(Boolean)
  },
}

type Repository = typeof repository

export type { Repository }

export default repository
