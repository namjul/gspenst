import { slugify } from '@tryghost/string'
import { okAsync, errAsync, combine } from 'neverthrow'
import type { GetResourcesQuery } from '../.tina/__generated__/types'
import * as api from './api'
import db from './db'
import { toArray } from './utils'
import { assertUnreachable } from './helpers'
import type {
  ResourceType,
  ResourceItem,
  Get,
  DynamicVariables,
  ResultAsync,
  Optional,
} from './types'
import * as Errors from './errors'

type RepoResultAsync<T> = ResultAsync<T>

type ResourcesNode = Get<
  GetResourcesQuery,
  'getCollections[0].documents.edges[0].node'
>

// https://github.com/sindresorhus/map-obj

type GetValue<T extends ID | ID[]> = RepoResultAsync<
  T extends ID[] ? ResourceItem[] : ResourceItem
>

type FindAllValue<T extends Optional<ResourceType>> = RepoResultAsync<
  (T extends null | undefined
    ? ResourceItem
    : Extract<ResourceItem, { resourceType: T }>)[]
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
          return (resource.documents.edges ?? []).map((connectionEdge) => {
            if (connectionEdge?.node) {
              const { node } = connectionEdge
              const {
                __typename,
                id,
                sys: { filename, path: filepath, relativePath },
              } = node

              if (__typename === 'ConfigDocument') {
                return this.set({
                  id,
                  filename,
                  path: filepath,
                  resourceType: 'config',
                  relativePath,
                })
              } else {
                const dynamicVariables = this._generateDynamicVariables(node)

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
  set(resourceItem: ResourceItem) {
    return db.set('resources', resourceItem.id, JSON.stringify(resourceItem))
  },

  get<T extends ID | ID[]>(id: T): GetValue<T> {
    const ids = toArray(id)

    const result = db.get('resources', ...ids).map((values) => {
      const resources = values.map((current, index) => {
        if (!current) {
          return errAsync(Errors.notFound(`Repo: ${ids[index]}`))
        }

        const resourceItem = JSON.parse(current) as ResourceItem

        if (!resourceItem.dataResult) {
          const dataResult = (() => {
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
              case 'config':
                return api.getConfig()
              default:
                return assertUnreachable(resourceType)
            }
          })() // Immediately invoke the function
          resourceItem.dataResult = dataResult
        }

        return resourceItem
      })

      if (ids.length === 1) {
        return resources[0]
      }
      return resources
    })

    return result as GetValue<T>
  },

  getAll() {
    return db.keys('resources').andThen((ids) => this.get(ids))
  },

  async find(
    partialResourceItem: Partial<ResourceItem>
  ): Promise<RepoResultAsync<ResourceItem | undefined>> {
    const resources = await this.getAll()
    if (resources.isOk()) {
      const found = Object.values(resources.value).find(
        this.match(partialResourceItem)
      )
      return okAsync(found)
    }
    return errAsync(resources.error)
  },

  async findAll<T extends Optional<ResourceType>>(
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

  match<T extends ResourceItem>(partialResourceItem: Partial<T>) {
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

  _generateDynamicVariables(
    node: NonNullable<Exclude<ResourcesNode, { __typename: 'ConfigDocument' }>>
  ): DynamicVariables {
    const {
      __typename,
      data,
      sys: { filename },
    } = node

    const [slug, primary_tag, primary_author] = (() => {
      /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
      const empty = 'all'
      if (__typename === 'PageDocument' || __typename === 'PostDocument') {
        const tag = data.tags?.[0]?.tag
        const author = data.authors?.[0]?.author
        return [
          node.data.slug || filename,
          tag?.data.slug || tag?.sys.filename || empty,
          author?.data.slug || author?.sys.filename || empty,
        ]
      }
      return [data.slug || node.data.name || filename, empty, empty]
      /* eslint-enable */
    })() // IIFE

    const date = new Date(data.date!) // TODO warn if date is not defined
    const [day, month, year] = date
      .toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .split('/')
      .map(Number) as [number, number, number]

    return {
      slug: slugify(slug),
      year,
      month,
      day,
      primary_tag,
      primary_author,
    }
  },
}

type Repository = typeof repository

export type { Repository }

export default repository
