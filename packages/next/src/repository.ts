import slugify from 'slugify'
import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import redis from './redis'
import { toArray, ensureString } from './utils'
import { assertUnreachable } from './helpers'
import type { ResourceType, ResourceItem } from './types'
import { find } from './dataUtils'

// https://github.com/sindresorhus/map-obj

type Resources = {
  [id: ID]: ResourceItem
}

const repository = {
  redis,
  client: ExperimentalGetTinaClient(), // eslint-disable-line new-cap
  async init() {
    await this.redis.flushall()
    const { data } = await this.client.getResources()

    const { getCollections: resources } = data

    void (await Promise.all(
      resources
        .filter((resource) =>
          ['page', 'post', 'author', 'tag'].includes(resource.name)
        )
        .map(async (resource) => {
          void (await Promise.all(
            (resource.documents.edges ?? []).map(async (connectionEdge) => {
              if (connectionEdge?.node) {
                const {
                  id,
                  sys: { filename, path: filepath, relativePath },
                } = connectionEdge.node

                await this.set({
                  id,
                  filename,
                  path: filepath,
                  slug: slugify(filename),
                  resource: resource.name as ResourceType,
                  relativePath,
                  data: undefined,
                })
              }
            })
          ))
        })
    ))

    void (await this.getAll())
  },
  async set(resourceItem: ResourceItem) {
    await this.redis.hset(
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
    return (await this.redis.hmget('resources', ...ids)).reduce<
      Promise<Resources>
    >(async (promise, current) => {
      const acc = await promise

      ensureString(current)

      const resourceItem = JSON.parse(current) as ResourceItem

      if (!resourceItem.data) {
        const data = (async () => {
          const { resource: resourceType, relativePath } = resourceItem
          switch (resourceType) {
            case 'page':
              return this.client.getPage({ relativePath })
            case 'post':
              return this.client.getPost({ relativePath })
            case 'author':
              return this.client.getAuthor({ relativePath })
            case 'tag':
              // TODO
              throw new Error('needs to be implemented')
            default:
              return assertUnreachable(resourceType)
          }
        })() // Immediately invoke the function
        resourceItem.data = await data
      }

      acc[resourceItem.id] = resourceItem
      return Promise.resolve(acc)
    }, Promise.resolve({}))
  },
  async getAll() {
    const ids = await this.redis.hkeys('resources')
    return this.get(ids)
  },
  async find(
    partialResourceItem: Partial<ResourceItem>
  ): Promise<ResourceItem | undefined> {
    return find(Object.values(await this.getAll()), partialResourceItem)
  },
}

type Repository = typeof repository

export type { Repository }
export default repository
