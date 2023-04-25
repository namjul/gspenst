import {
  schema,
  normalize as _normalize,
  denormalize as _denormalize,
  type NormalizedSchema,
} from 'normalizr'
import { type ValueOf } from 'type-fest'
import {
  type Result,
  type ID,
  combine,
  fromThrowable,
  z,
} from '../shared/kernel'
import * as Errors from '../errors'
import { type Resource } from '../domain/resource'
import { type RoutingMapping } from '../helpers/getPageMap'
import { filterLocatorResources, isConfigResource } from '../helpers/resource'
import { postSchema, createPost, type Post } from '../domain/post'
import { pageSchema, createPage, type Page } from '../domain/page'
import { authorSchema, createAuthor, type Author } from '../domain/author'
import { tagSchema, createTag, type Tag } from '../domain/tag'
import { configSchema, createConfig, type Config } from '../domain/config'
import { assertUnreachable, do_ } from '../shared/utils'
import { type Entities } from '../domain/entity'

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
        return [createPost(resource.data.data.post, routingMapping)]
      case 'page':
        return [createPage(resource.data.data.page, routingMapping)]
      case 'author':
        return [createAuthor(resource.data.data.author, routingMapping)]
      case 'tag':
        return [createTag(resource.data.data.tag, routingMapping)]
      case 'config':
        return [createConfig(resource.data.data.config)]
      case 'routes':
        return []
      default:
        return assertUnreachable(type)
    }
  })

  // TODO check why this is necessary
  if (isConfigResource(resource)) {
    const configEntity = createConfig(resource.data.data.config)
    entitiesResultList.push(configEntity)
  }

  return combine(entitiesResultList).map((entities) => {
    return entities.map((entity) => {
      if ('path' in entity && filterLocatorResources(resource)) {
        entity.path = resource.metadata.path
      }
      return entity
    })
  })
}
