import { ok, err, okAsync, errAsync, combine } from './shared-kernel'
import db from './db'
import type { ResourceType, Resource } from './domain/resource'
import type { RoutesConfig } from './domain/routes'
import { getCollections } from './domain/routes'
import { createResource, createDynamicVariables } from './domain/resource'
import { createPost } from './domain/post'
import type { ID, ResultAsync } from './shared-kernel'
import * as Errors from './errors'
import * as api from './api'
import { do_ } from './utils'
import { makeNqlFilter, compilePermalink } from './helpers'

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
  collect(routingConfig: RoutesConfig = {}) {

    const collections = getCollections(routingConfig)

    return combine([db.clear(), api
      .getResources()])
      .map((results) => {
        return results.flatMap(collectionResources => {
        if (collectionResources === 'OK') {
          return []
        }
        return collectionResources.data.collections.flatMap((collection) => {
          return (collection.documents.edges ?? []).flatMap(
            (collectionEdge) => {
              return collectionEdge?.node ?? []
            }
          )
        })

        })
      })
      .andThen((nodes) => {
        return combine(
          nodes.flatMap((node) => {
            if (node.__typename === 'Config') {
              return []
            } else {
              const resourceUrlPathnameResult = do_(() => {
                const dynamicVariablesResult = createDynamicVariables(node)
                if (node.__typename === 'Post') {
                  const collectionEntry = collections.find(
                    ([_, collection]) => {
                      const filter = collection.filter
                        ? makeNqlFilter(collection.filter)
                        : () => true
                      const post = createPost(node)
                      return filter(post)
                    }
                  )
                  if (collectionEntry) {
                    const [ignored, { permalink }] = collectionEntry
                    if (dynamicVariablesResult.isErr()) {
                      return err(dynamicVariablesResult.error)
                    }
                    return compilePermalink(
                      permalink,
                      dynamicVariablesResult.value
                    )
                  }
                } else if (node.__typename === 'Page') {
                  if (dynamicVariablesResult.isErr()) {
                    return err(dynamicVariablesResult.error)
                  }
                  return ok(`/${dynamicVariablesResult.value.slug}`)
                } else {
                  const taxonomyEntry =
                    node.__typename === 'Author'
                      ? routingConfig.taxonomies?.author
                      : routingConfig.taxonomies?.tag
                  if (taxonomyEntry) {
                    if (dynamicVariablesResult.isErr()) {
                      return err(dynamicVariablesResult.error)
                    }
                    return compilePermalink(
                      taxonomyEntry.permalink,
                      dynamicVariablesResult.value
                    )
                  }
                }
                return ok(undefined)
              })

              if (resourceUrlPathnameResult.isErr()) {
                return errAsync(resourceUrlPathnameResult.error)
              }

              const resourceResult = createResource(
                node,
                resourceUrlPathnameResult.value
              )
              if (resourceResult.isOk()) {
                return this.set(resourceResult.value).map(
                  () => resourceResult.value
                )
              }
              return errAsync(resourceResult.error)
            }
          })
        )
      })
      .map((resources) => {
        return resources.flatMap(
          ({ id, urlPathname, resourceType, filename, filepath }) => ({
            id,
            urlPathname,
            resourceType,
            filename,
            filepath,
          })
        )
      })
  },

  set(resource: Resource) {
    return db.set<Resource>('resources', String(resource.id), resource)
  },

  get<T extends ID | ID[]>(id: T): GetValue<T> {
    const ids = [id].flat()

    const result = db
      .get<Resource>('resources', ...ids.map(String))
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
