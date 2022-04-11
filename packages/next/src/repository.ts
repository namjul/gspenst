import { slugify } from '@tryghost/string'
import type { GetResourcesQuery } from '../.tina/__generated__/types'
import redis from './redis'
import * as api from './api'
import { toArray, ensureString } from './utils'
import { assertUnreachable } from './helpers'
import type {
  ResourceType,
  ResourceItem,
  Get,
  DynamicVariables,
  Optional,
} from './types'
import { find } from './dataUtils'

type ResourcesNode = Get<
  GetResourcesQuery,
  'getCollections[0].documents.edges[0].node'
>

// https://github.com/sindresorhus/map-obj

type Resources<T extends ResourceItem> = {
  [id: ID]: T
}

type GetValue<T extends ID | ID[]> = T extends ID[]
  ? Resources<ResourceItem>
  : ResourceItem | undefined

type GetAllValue<T extends Optional<ResourceType>> = T extends null | undefined
  ? Resources<ResourceItem>
  : Resources<Extract<ResourceItem, { resourceType: T }>>

const repository = {
  store: redis,
  api, // eslint-disable-line new-cap
  async init() {
    await this.store.flushall()
    const resourcesResult = await this.api.getResources()

    if (resourcesResult.isOk()) {
      const { getCollections: resources } = resourcesResult.value.data

      void (await Promise.all(
        resources.map(async (resource) => {
          void (await Promise.all(
            (resource.documents.edges ?? []).map(async (connectionEdge) => {
              if (connectionEdge?.node) {
                const { node } = connectionEdge
                const {
                  __typename,
                  id,
                  sys: { filename, path: filepath, relativePath },
                } = node

                if (__typename === 'ConfigDocument') {
                  await this.set({
                    id,
                    filename,
                    path: filepath,
                    resourceType: 'config',
                    relativePath,
                  })
                } else {
                  const dynamicVariables = await this._generateDynamicVariables(
                    node
                  )

                  await this.set({
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
            })
          ))
        })
      ))
    }

    void (await this.getAll())

    return resourcesResult
  },
  async set(resourceItem: ResourceItem) {
    await this.store.hset(
      'resources',
      resourceItem.id,
      JSON.stringify(resourceItem)
    )
  },

  async get<T extends ID | ID[]>(id: T): Promise<GetValue<T>> {
    if (!id) {
      return undefined as GetValue<T>
    }

    const ids = toArray(id)
    const result = await (
      await this.store.hmget('resources', ...ids)
    ).reduce<Promise<Resources<ResourceItem>>>(async (promise, current) => {
      const acc = await promise

      ensureString(current)

      const resourceItem = JSON.parse(current) as ResourceItem

      if (!resourceItem.dataResult) {
        const dataResult = await (async () => {
          const { resourceType, relativePath } = resourceItem
          switch (resourceType) {
            case 'page':
              return this.api.getPage({ relativePath })
            case 'post':
              return this.api.getPost({ relativePath })
            case 'author':
              return this.api.getAuthor({ relativePath })
            case 'tag':
              return this.api.getTag({ relativePath })
            case 'config':
              return this.api.getConfig()
            default:
              return assertUnreachable(resourceType)
          }
        })() // Immediately invoke the function
        resourceItem.dataResult = dataResult
      }

      acc[resourceItem.id] = resourceItem
      return Promise.resolve(acc)
    }, Promise.resolve({}))

    if (Array.isArray(id)) {
      return result as GetValue<T>
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion --- for some reason typescript does recognize id as `string |  string[]`
    return result[id as string] as GetValue<T>
  },

  async getAll<T extends Optional<ResourceType>>(
    resourceType?: T
  ): Promise<GetAllValue<T>> {
    const ids = await this.store.hkeys('resources')
    const resources = await this.get(ids)

    if (resourceType) {
      const x = Object.fromEntries(
        Object.entries(resources).filter((resource) => {
          return resource[1].resourceType === resourceType
        })
      )
      return x as GetAllValue<T>
    }
    return resources as GetAllValue<T>
  },

  async find(
    partialResourceItem: Partial<ResourceItem>
  ): Promise<ResourceItem | undefined> {
    return find(Object.values(await this.getAll()), partialResourceItem)
  },

  async _generateDynamicVariables(
    node: NonNullable<Exclude<ResourcesNode, { __typename: 'ConfigDocument' }>>
  ): Promise<DynamicVariables> {
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
