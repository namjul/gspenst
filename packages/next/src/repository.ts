import { okAsync, errAsync, combine } from './shared-kernel'
import * as api from './api'
import db from './db'
import { absurd } from './helpers'
import type { ResourceType, Resource } from './domain/resource'
import { createResource } from './domain/resource'
import type { ID, WithRequired, ResultAsync } from './shared-kernel'
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
  async init() {
    const clearResult = await db.clear()

    if (clearResult.isErr()) {
      return clearResult
    }

    const resourcesResult = await api.getResources()

    if (resourcesResult.isErr()) {
      return resourcesResult
    }

    const result = resourcesResult.value.data.getCollections.flatMap(
      (collection) => {
        return (collection.documents.edges ?? []).flatMap((connectionEdge) => {
          if (connectionEdge?.node) {
            const { node } = connectionEdge
            if (node.__typename === 'ConfigDocument') {
              return []
            } else {
              const resourceResult = createResource(node)
              if (resourceResult.isOk()) {
                return this.set(resourceResult.value)
              }
              return errAsync(resourceResult.error)
            }
          }
          return errAsync(Errors.other('Should not happen'))
        })
      }
    )
    // void (await this.getAll()) // TODO describe why doing this here

    return combine(result)
  },
  set(resource: Resource) {
    return db.set<Resource>('resources', String(resource.id), resource)
  },

  async get<T extends ID | ID[]>(id: T): Promise<GetValue<T>> {
    const ids = [id].flat()

    const result = await db.get<Resource>('resources', ...ids.map(String))

    if (result.isOk()) {
      const resources = await Promise.all(
        result.value.map(async (resource) => {
          if (resource.dataResult) {
            return okAsync(resource as ResourceItemLoaded)
          } else {
            const dataResult = await (async () => {
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

            if (dataResult.isErr()) {
              return errAsync(dataResult.error)
            }
            resource.dataResult = dataResult.value

            return okAsync(resource as ResourceItemLoaded)
          }
        })
      )

      if (ids.length === 1) {
        return resources[0]!
      }

      const x = combine(resources)
      return x

      // TODO save resource with dataResult now set
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
    return this.get(idsResult.value as unknown as ID[])
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
