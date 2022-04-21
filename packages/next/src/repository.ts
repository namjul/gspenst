import { okAsync, errAsync, combine } from 'neverthrow'
import * as api from './api'
import db from './db'
import { absurd } from './helpers'
import type { ResourceType, Resource } from './domain/resource'
import { generateDynamicVariables } from './domain/resource'
import type { ResultAsync, WithRequired } from './types'
import * as Errors from './errors'

type RepoResultAsync<T> = ResultAsync<T>

type ResourceItemLoaded = WithRequired<Resource, 'dataResult'>
type GetValue<T extends ID | ID[]> = T extends ID[]
  ? RepoResultAsync<ResourceItemLoaded[]>
  : RepoResultAsync<ResourceItemLoaded>

type FindAllValue<T extends ResourceType> = RepoResultAsync<
  (T extends null | undefined
    ? ResourceItemLoaded
    : Extract<ResourceItemLoaded, { resourceType: T }>)[]
>

const repository = {
  init() {
    const result = combine([db.clear(), api.getResources()]).map((results) => {
      return results.map((r) => {
        if (r === 'OK') {
          return r
        }

        const { getCollections: resources } = r.data

        return resources.flatMap((resource) => {
          return (resource.documents.edges ?? []).flatMap((connectionEdge) => {
            if (connectionEdge?.node) {
              const { node } = connectionEdge
              const {
                __typename,
                id,
                sys: { filename, path: filepath, relativePath },
              } = node

              if (__typename === 'ConfigDocument') {
                return []
              } else {
                const dynamicVariables = generateDynamicVariables(node)

                return this.set({
                  id,
                  filename,
                  path: filepath,
                  resourceType: resource.name as Exclude<
                    ResourceType,
                    'config'
                  >,
                  relativePath,
                  ...dynamicVariables,
                })
              }
            }
            return errAsync(Errors.other('Should not happen'))
          })
        })
      })
    })

    // void (await this.getAll()) // TODO describe why doing this here

    return result
  },
  set(resourceItem: Resource) {
    return db.set<Resource>('resources', resourceItem.id, resourceItem)
  },

  async get<T extends ID | ID[]>(id: T): Promise<GetValue<T>> {
    const ids = [id].flat()

    const result = await db.get<Resource>('resources', ...ids)

    if (result.isOk()) {
      const resources = await Promise.all(
        result.value.map(async (resourceItem) => {
          if (resourceItem.dataResult) {
            return okAsync(resourceItem as ResourceItemLoaded)
          } else {
            const dataResult = await (async () => {
              const { resourceType, relativePath } = resourceItem
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

            if (dataResult.isErr()) {
              const x = errAsync(dataResult.error)
              return x
            }
            resourceItem.dataResult = dataResult.value

            return okAsync(resourceItem as ResourceItemLoaded)
          }
        })
      )

      if (ids.length === 1) {
        return resources[0]!
      }

      const x = combine(resources)
      return x

      // TODO save resourceItem with dataResult now set
    } else {
      const x = errAsync(result.error)
      return x
    }
  },

  async getAll() {
    const idsResult = await db.keys('resources')
    if (idsResult.isErr()) {
      return errAsync(idsResult.error)
    }
    return this.get(idsResult.value)
  },

  async find(
    partialResourceItem: Partial<Resource>
  ): Promise<RepoResultAsync<ResourceItemLoaded>> {
    const resources = await this.getAll()
    if (resources.isOk()) {
      const found = resources.value.find(this.match(partialResourceItem))
      return found
        ? okAsync(found)
        : errAsync(
            Errors.notFound(
              `Repo: ${JSON.stringify(partialResourceItem, null, 2)}`
            )
          )
    }
    return errAsync(resources.error)
  },

  async findAll<T extends ResourceType>(
    resourceType?: T
  ): Promise<FindAllValue<T>> {
    const resources = await this.getAll()
    if (resources.isOk()) {
      if (resourceType) {
        const found = Object.values(resources.value).filter(
          this.match({ resourceType })
        )
        return okAsync(found) as FindAllValue<T>
      }
      return okAsync(resources.value) as FindAllValue<T>
    }
    return errAsync(resources.error) as FindAllValue<T>
  },

  match<T extends Resource>(partialResourceItem: Partial<T>) {
    return (resourceItem: T) =>
      (partialResourceItem.resourceType
        ? partialResourceItem.resourceType === resourceItem.resourceType
        : true) &&
      Object.entries(partialResourceItem)
        .map(([key, value]) => {
          return (
            String(resourceItem[key as keyof typeof partialResourceItem]) ===
            String(value)
          )
        })
        .every(Boolean)
  },
}

type Repository = typeof repository

export type { Repository }

export default repository
