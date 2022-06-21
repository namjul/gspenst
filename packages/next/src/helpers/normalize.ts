import {
  schema,
  normalize as _normalize,
  denormalize as _denormalize,
} from 'normalizr'
import type { NormalizedSchema } from 'normalizr'
import { combine, fromThrowable, err } from '../shared/kernel'
import * as Errors from '../errors'
import type { Resource } from '../domain/resource'
import type { Post, PostNormalized } from '../domain/post'
import type { Page, PageNormalized } from '../domain/page'
import type { Author } from '../domain/author'
import type { Tag } from '../domain/tag'
import type { Config } from '../domain/config'
import type { Result, ID } from '../shared/kernel'
import { absurd, isNumber } from '../shared/utils'
import { createPost } from '../domain/post'
import { createPage } from '../domain/page'
import { createAuthor } from '../domain/author'
import { createTag } from '../domain/tag'
import { createConfig } from '../domain/config'

export type Entity = Config | Post | Page | Author | Tag

export type Entities = {
  configs?: { [id: ID]: Config }
  posts?: { [id: ID]: PostNormalized }
  pages?: { [id: ID]: PageNormalized }
  authors?: { [id: ID]: Author }
  tags?: { [id: ID]: Tag }
  resources?: { [id: ID]: Resource }
}

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

const resourceEntitySchema = new schema.Entity('resources')
resourceEntitySchema.define({ relationships: [resourceEntitySchema] })

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

export function normalizeResource(resource: Resource) {
  return resolveResourceData(resource).andThen((entity) => {
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

export function normalizeResources(resources: Resource[]) {
  return combine(resources.map(resolveResourceData)).andThen((entityList) => {
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

export function resolveResourceData(resource: Resource): Result<Entity> {
  if ('relationships' in resource) {
    if (resource.relationships.some((relResource) => isNumber(relResource))) {
      return err(
        Errors.other(
          `Resource at \`${resource.filepath}\` should be denormalized`
        )
      )
    }
  }

  const { resourceType } = resource
  switch (resourceType) {
    case 'post':
      return createPost(resource)
    case 'page':
      return createPage(resource)
    case 'author':
      return createAuthor(resource)
    case 'tag':
      return createTag(resource)
    case 'config':
      return createConfig(resource)
    default:
      return absurd(resourceType)
  }
}
