import { okAsync, errAsync, combine } from './shared-kernel'
import * as api from './api'
import db from './db'
import { absurd } from './helpers'
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
  init() {
    // void (await this.getAll()) // TODO describe why doing this here
    return combine([db.clear(), api.getResources()]).andThen((results) => {
      const result = combine(
        results.flatMap((r) => {
          if (r === 'OK') {
            return []
          } else {
            const e = r.data.getCollections.flatMap((collection) => {
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
        const x = resources.map((resource) => {
          if (resource.dataResult) {
            return okAsync(resource)
          } else {
            const dataResultResult = (() => {
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

            // TODO rename `dataResult` field into `data`
            return dataResultResult
              .map((dataResult) => {
                resource.dataResult = dataResult
                return this.set(resource).andThen(() => okAsync(resource))
              })
              .andThen((resourceResult) => resourceResult)
          }
        })

        return combine(x)
      })
      .map((e) => {
        if (ids.length === 1) {
          return e[0]
        }
        return e
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
