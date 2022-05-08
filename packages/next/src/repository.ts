import { ok, err, okAsync, errAsync, combine } from './shared-kernel'
import db from './db'
import type {
  ResourceType,
  Resource,
  ResourcesNode,
  DynamicVariables,
} from './domain/resource'
import type { RoutesConfig } from './domain/routes'
import type { Post } from './domain/post'
import { getCollections, getRoutes } from './domain/routes'
import { createResource, createDynamicVariables } from './domain/resource'
import { createPost } from './domain/post'
import type { ID, Result, ResultAsync } from './shared-kernel'
import * as Errors from './errors'
import * as api from './api'
import { makeNqlFilter, compilePermalink } from './helpers'
import { do_ } from './utils'

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
    return combine([db.clear(), api.getResources()])
      .map((results) => {
        return results.flatMap((collectionResources) => {
          if (collectionResources === 'OK') {
            return []
          }
          return collectionResources.data.collections.flatMap((collection) => {
            return (collection.documents.edges ?? []).flatMap(
              (collectionEdge) => {
                if (collectionEdge?.node) {
                  return collectionEdge.node.__typename === 'Config'
                    ? []
                    : collectionEdge.node
                }
                return []
              }
            )
          })
        })
      })
      .andThen((nodes) => {
        return combine(
          nodes.reduce<
            Result<
              | Resource
              | {
                  dynamicVariables: DynamicVariables
                  post: Post
                  node: ResourcesNode
                }
            >[]
          >((acc, current) => {
            const dynamicVariablesResult = createDynamicVariables(current)
            if (dynamicVariablesResult.isErr()) {
              acc.push(err(dynamicVariablesResult.error))
              return acc
            }
            if (current.__typename === 'Post') {
              const postResult = createPost(current)
              if (postResult.isErr()) {
                acc.push(err(postResult.error))
                return acc
              }
              acc.push(
                ok({
                  dynamicVariables: dynamicVariablesResult.value,
                  node: current,
                  post: postResult.value,
                })
              )
            } else {
              const urlPathname = do_(() => {
                if (current.__typename === 'Page') {
                  return `/${dynamicVariablesResult.value.slug}`
                } else {
                  const taxonomyEntry =
                    current.__typename === 'Author'
                      ? routesConfig.taxonomies?.author
                      : routesConfig.taxonomies?.tag
                  if (taxonomyEntry) {
                    const permalinkResult = compilePermalink(
                      taxonomyEntry.permalink,
                      dynamicVariablesResult.value
                    )
                    if (permalinkResult.isErr()) {
                      acc.push(err(permalinkResult.error))
                    } else {
                      return permalinkResult.value
                    }
                  } else {
                    return undefined
                  }
                }
              })
              acc.push(createResource(current, urlPathname))
            }
            return acc
          }, [])
        ).andThen((maybeResources) => {
          const routesFilters = [
            ...getRoutes(routesConfig).flatMap(
              ([_, route]) => route.filter ?? []
            ),
            ...maybeResources.flatMap((maybeResource) => {
              if (
                'resourceType' in maybeResource &&
                (maybeResource.resourceType === 'tag' ||
                  maybeResource.resourceType === 'author')
              ) {
                const taxonomyRoute =
                  routesConfig.taxonomies?.[maybeResource.resourceType]
                return taxonomyRoute
                  ? taxonomyRoute.filter.replace(/%s/g, maybeResource.slug)
                  : []
              }
              return []
            }),
          ]

          return combine(
            maybeResources.flatMap((maybeResource) => {
              if ('post' in maybeResource) {
                const collectionEntry = getCollections(routesConfig).find(
                  ([_, collection]) => {
                    const nqlFilter = collection.filter
                      ? makeNqlFilter(collection.filter)
                      : () => ok(true)

                    const nqlFilterResult = nqlFilter(maybeResource.post)
                    if (nqlFilterResult.isErr()) {
                      return false
                    }
                    return nqlFilterResult.value
                  }
                )
                const matchingFilter = routesFilters.filter((routeFilter) => {
                  const nqlFilter = makeNqlFilter(routeFilter)
                  const nqlFilterResult = nqlFilter(maybeResource.post)
                  if (nqlFilterResult.isErr()) {
                    return false
                  }
                  return nqlFilterResult.value
                })

                // if post is part of a collection
                if (collectionEntry) {
                  const [ignored, { permalink, filter }] = collectionEntry
                  const permalinkResult = compilePermalink(
                    permalink,
                    maybeResource.dynamicVariables
                  )
                  if (permalinkResult.isErr()) {
                    return err(permalinkResult.error)
                  }
                  return createResource(
                    maybeResource.node,
                    permalinkResult.value,
                    matchingFilter.concat(filter ? filter : [])
                  )
                }

                // post is not part of a collection
                const urlPathname = undefined
                return createResource(
                  maybeResource.node,
                  urlPathname,
                  matchingFilter
                )
              }

              return ok(maybeResource)
            })
          )
        })
      })
      .andThen((resources) => {
        const p = resources.map((resource) => {
          return this.set(resource).map(() => {
            return resource
          })
        })
        return combine(p)
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
