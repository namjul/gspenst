import {
  schema,
  normalize as _normalize,
  denormalize as _denormalize,
} from 'normalizr'
import type { ValueOf } from 'type-fest'
import type { NormalizedSchema } from 'normalizr'
import { combine, fromThrowable } from '../shared/kernel'
import * as Errors from '../errors'
import type { Resource, RoutingMapping } from '../domain/resource'
import type { Post } from '../domain/post'
import type { Page } from '../domain/page'
import type { Author } from '../domain/author'
import type { Tag } from '../domain/tag'
import type { Config } from '../domain/config'
import type { Result, ID } from '../shared/kernel'
import { absurd, do_ } from '../shared/utils'
import { createPost } from '../domain/post'
import { createPage } from '../domain/page'
import { createAuthor } from '../domain/author'
import { createTag } from '../domain/tag'
import { createConfig } from '../domain/config'
import type { Entities } from '../domain/theming'

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

export type Entity = Config | Post | Page | Author | Tag

const resourceEntitySchema = new schema.Entity('resource')

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
}

export function normalizeEntities(data: {
  config?: Config[]
  post?: Post[]
  page?: Page[]
  tag?: Tag[]
  author?: Author[]
  resource?: Resource[]
}) {
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
  return resolveResourceData(resource, routingMapping).andThen((entity) => {
    return normalizeEntities({
      [`${resource.resourceType}`]: [entity],
      resource: [resource],
    }).map(({ entities }) => {
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
      entityList.reduce<Required<Parameters<typeof normalizeEntities>[0]>>(
        (acc, entity, index) => {
          const resource = resources[index]
          if (resource) {
            acc.resource.push(resource)
            const { resourceType } = resource
            if (resourceType === 'post' && entity.type === 'post') {
              acc.post.push(entity)
            } else if (resourceType === 'page' && entity.type === 'page') {
              acc.page.push(entity)
            } else if (resourceType === 'author' && entity.type === 'author') {
              acc.author.push(entity)
            } else if (resourceType === 'tag' && entity.type === 'tag') {
              acc.tag.push(entity)
            } else if (resourceType === 'config' && entity.type === 'config') {
              acc.config.push(entity)
            }
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
): Result<Entity> {
  return do_(() => {
    const { resourceType } = resource
    switch (resourceType) {
      case 'post':
        return createPost(resource.tinaData.data.post, routingMapping)
      case 'page':
        return createPage(resource.tinaData.data.page, routingMapping)
      case 'author':
        return createAuthor(resource.tinaData.data.author, routingMapping)
      case 'tag':
        return createTag(resource.tinaData.data.tag, routingMapping)
      case 'config':
        return createConfig(resource.tinaData.data.config)
      default:
        return absurd(resourceType)
    }
  }).map((entity) => {
    if ('path' in entity && 'path' in resource) {
      entity.path = resource.path
    }
    return entity
  })
}
