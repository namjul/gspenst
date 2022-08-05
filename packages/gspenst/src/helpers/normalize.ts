import {
  schema,
  normalize as _normalize,
  denormalize as _denormalize,
} from 'normalizr'
import type { ValueOf } from 'type-fest'
import type { NormalizedSchema } from 'normalizr'
import { combine, fromThrowable, z } from '../shared/kernel'
import * as Errors from '../errors'
import type { Resource } from '../domain/resource'
import type { RoutingMapping } from '../helpers/getPageMap'
import type { Post } from '../domain/post'
import type { Page } from '../domain/page'
import type { Author } from '../domain/author'
import type { Tag } from '../domain/tag'
import type { Config } from '../domain/config'
import type { Result, ID } from '../shared/kernel'
import { assertUnreachable, do_ } from '../shared/utils'
import { postSchema, createPost } from '../domain/post'
import { pageSchema, createPage } from '../domain/page'
import { authorSchema, createAuthor } from '../domain/author'
import { tagSchema, createTag } from '../domain/tag'
import { configSchema, createConfig } from '../domain/config'
import type { Entities } from '../domain/entity'

export const normalize = fromThrowable(_normalize, (error) =>
  Errors.other(
    '`normalizr#normalize`',
    error instanceof Error ? error : undefined
  )
)

export const denormalize = fromThrowable(_denormalize, (error) =>
  Errors.other(
    '`normalizr#denormalize`',
    error instanceof Error ? error : undefined
  )
)

const entitySchema = z.discriminatedUnion('type', [
  postSchema,
  pageSchema,
  authorSchema,
  tagSchema,
  configSchema,
])

export type Entity = z.infer<typeof entitySchema>

const resourceEntitySchema = new schema.Entity('resource')

const configEntitySchema = new schema.Entity('config')
const tagEntitySchema = new schema.Entity('tag')
const authorEntitySchema = new schema.Entity('author')
const postEntitySchema = new schema.Entity('post', {
  primary_author: authorEntitySchema,
  primary_tag: tagEntitySchema,
  authors: [authorEntitySchema],
  tags: [tagEntitySchema],
})
const pageEntitySchema = new schema.Entity('page', {
  primary_author: authorEntitySchema,
  primary_tag: tagEntitySchema,
  authors: [authorEntitySchema],
  tags: [tagEntitySchema],
})

const entitiesSchema = {
  post: [postEntitySchema],
  page: [pageEntitySchema],
  tag: [tagEntitySchema],
  author: [authorEntitySchema],
  resource: [resourceEntitySchema],
  config: [configEntitySchema],
}

type DenormalizedEntities = {
  config?: Config[]
  post?: Post[]
  page?: Page[]
  tag?: Tag[]
  author?: Author[]
  resource?: Resource[]
}

export function normalizeEntities(data: DenormalizedEntities) {
  return normalize(data, entitiesSchema) as Result<
    NormalizedSchema<
      Entities,
      {
        [name in keyof typeof data]?: ID[]
      }
    >
  >
}

export function denormalizeEntities<T extends Partial<Entities>>(
  data: {
    [name in keyof T]?: ID[]
  },
  entities: T
): Result<{
  [name in keyof T]: NonNullable<ValueOf<T[name]>>[]
}> {
  return denormalize(data, entitiesSchema, entities)
}

export function normalizeResource(
  resource: Resource,
  routingMapping: RoutingMapping = {}
) {
  return resolveResourceData(resource, routingMapping).andThen((entityList) => {
    const x = {
      ...entityList.reduce<Required<DenormalizedEntities>>(
        (acc, current) => {
          const { type } = current
          switch (type) {
            case 'post':
              acc.post.push(current)
              break
            case 'page':
              acc.page.push(current)
              break
            case 'author':
              acc.author.push(current)
              break
            case 'tag':
              acc.tag.push(current)
              break
            case 'config':
              acc.config.push(current)
              break
            default:
              return assertUnreachable(type)
          }
          return acc
        },
        {
          config: [],
          post: [],
          page: [],
          tag: [],
          author: [],
          resource: [resource],
        }
      ),
    }
    return normalizeEntities(x).map(({ entities }) => {
      return {
        result: resource.id,
        entities,
      }
    })
  })
}

export function normalizeResources(
  resources: Resource[],
  routingMapping: RoutingMapping = {}
) {
  return combine(
    resources.map((resource) => resolveResourceData(resource, routingMapping))
  ).andThen((entityList) => {
    return normalizeEntities(
      entityList.reduce<Required<DenormalizedEntities>>(
        (acc, entities, index) => {
          const resource = resources[index]
          if (resource) {
            entities.forEach((entity) => {
              acc.resource.push(resource)
              const { type } = resource
              if (type === 'post' && entity.type === 'post') {
                acc.post.push(entity)
              } else if (type === 'page' && entity.type === 'page') {
                acc.page.push(entity)
              } else if (type === 'author' && entity.type === 'author') {
                acc.author.push(entity)
              } else if (type === 'tag' && entity.type === 'tag') {
                acc.tag.push(entity)
              } else if (type === 'config' && entity.type === 'config') {
                acc.config.push(entity)
              }
            })
          }
          return acc
        },
        {
          config: [],
          post: [],
          page: [],
          tag: [],
          author: [],
          resource: [],
        }
      )
    ).map(({ entities }) => {
      return {
        result: resources.map((resource) => resource.id),
        entities,
      }
    })
  })
}

export function resolveResourceData(
  resource: Resource,
  routingMapping: RoutingMapping = {}
): Result<Entity[]> {
  const entitiesResultList: Result<Entity>[] = do_(() => {
    const { type } = resource
    switch (type) {
      case 'post':
        return [createPost(resource.tinaData.data.post, routingMapping)]
      case 'page':
        return [createPage(resource.tinaData.data.page, routingMapping)]
      case 'author':
        return [createAuthor(resource.tinaData.data.author, routingMapping)]
      case 'tag':
        return [createTag(resource.tinaData.data.tag, routingMapping)]
      case 'config':
        return [createConfig(resource.tinaData.data.config)]
      default:
        return assertUnreachable(type)
    }
  })

  if (resource.tinaData.data.config) {
    const configEntity = createConfig(resource.tinaData.data.config)
    entitiesResultList.push(configEntity)
  }

  return combine(entitiesResultList).map((entities) => {
    return entities.map((entity) => {
      if ('path' in entity && 'path' in resource) {
        entity.path = resource.path
      }
      return entity
    })
  })
}
