import {
  schema,
  normalize as _normalize,
  denormalize as _denormalize,
} from 'normalizr'
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

const resourceEntitySchema = new schema.Entity('resources')

const tagEntitySchema = new schema.Entity('tags')
const authorEntitySchema = new schema.Entity('authors')
const postEntitySchema = new schema.Entity('posts', {
  primary_author: authorEntitySchema,
  primary_tag: tagEntitySchema,
  authors: [authorEntitySchema],
  tags: [tagEntitySchema],
})
const pageEntitySchema = new schema.Entity('pages', {
  primary_author: authorEntitySchema,
  primary_tag: tagEntitySchema,
  authors: [authorEntitySchema],
  tags: [tagEntitySchema],
})

const entitiesSchema = {
  posts: [postEntitySchema],
  pages: [pageEntitySchema],
  tags: [tagEntitySchema],
  authors: [authorEntitySchema],
  resources: [resourceEntitySchema],
}

export function normalizeEntities(data: {
  configs?: Config[]
  posts?: Post[]
  pages?: Page[]
  tags?: Tag[]
  authors?: Author[]
  resources?: Resource[]
}) {
  // console.log('normalizeEntities', data);
  return normalize(data, entitiesSchema) as Result<
    NormalizedSchema<
      Entities,
      {
        configs?: ID[]
        posts?: ID[]
        pages?: ID[]
        tags?: ID[]
        authors?: ID[]
        resources?: ID[]
      }
    >
  >
}

export function denormalizeEntities(
  data: {
    configs?: ID[]
    posts?: ID[]
    pages?: ID[]
    tags?: ID[]
    authors?: ID[]
    resources?: ID[]
  },
  entities: Entities
): Result<{
  configs?: Config[]
  posts?: Post[]
  pages?: Page[]
  tags?: Tag[]
  authors?: Author[]
  resources?: Resource[]
}> {
  return denormalize(data, entitiesSchema, entities)
}

export function normalizeResource(
  resource: Resource,
  routingMapping: RoutingMapping = {}
) {
  return resolveResourceData(resource, routingMapping).andThen((entity) => {
    return normalizeEntities({
      [`${resource.resourceType}s`]: [entity],
      resources: [resource],
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
            acc.resources.push(resource)
            const { resourceType } = resource
            if (resourceType === 'post' && entity.type === 'post') {
              acc.posts.push(entity)
            } else if (resourceType === 'page' && entity.type === 'page') {
              acc.pages.push(entity)
            } else if (resourceType === 'author' && entity.type === 'author') {
              acc.authors.push(entity)
            } else if (resourceType === 'tag' && entity.type === 'tag') {
              acc.tags.push(entity)
            } else if (resourceType === 'config' && entity.type === 'config') {
              acc.configs.push(entity)
            }
          }
          return acc
        },
        {
          configs: [],
          posts: [],
          pages: [],
          tags: [],
          authors: [],
          resources: [],
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

export function denormalizeResource<T extends Resource>(
  resource: Resource,
  entities: Entities
) {
  return denormalizeEntities({ resources: [resource.id] }, entities).map(
    ({ resources = [] }) => {
      return resources.at(0) as T
    }
  )
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
