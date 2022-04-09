import slugify from 'slugify'
import type { GetResourcesQuery } from '../.tina/__generated__/types'
import redis from './redis'
import * as api from './api'
import { toArray, ensureString } from './utils'
import { assertUnreachable } from './helpers'
import type { ResourceType, ResourceItem, Get, DynamicVariables } from './types'
import { find } from './dataUtils'

type ResourcesNode = Get<
  GetResourcesQuery,
  'getCollections[0].documents.edges[0].node'
>

// https://github.com/sindresorhus/map-obj

type Resources = {
  [id: ID]: ResourceItem
}

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

  async get(id: ID | ID[] = []) {
    const ids = toArray(id)
    if (ids.length === 0) {
      return {}
    }
    return (await this.store.hmget('resources', ...ids)).reduce<
      Promise<Resources>
    >(async (promise, current) => {
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
  },
  async getAll() {
    const ids = await this.store.hkeys('resources')
    return this.get(ids)
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
      if (__typename === 'PageDocument' || __typename === 'PostDocument') {
        return [
          node.data.slug || filename, // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
          data.tags?.[0]?.tag?.data.slug, // TODO use existing resource
          data.authors?.[0]?.author?.data.slug, // TODO use existing resource
        ]
      }
      return [data.slug || node.data.name || filename] // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
    })() // Immediately-invoked Function Expression

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
