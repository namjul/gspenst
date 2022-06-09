import { Result as NeverThrowResult } from 'neverthrow'
import {
  schema,
  normalize as _normalize,
  denormalize as _denormalize,
} from 'normalizr'
import type { NormalizedSchema } from 'normalizr'
import { z } from '../shared-kernel'
import * as Errors from '../errors'
import { postNormalizedSchema } from '../domain/post'
import { pageNormalizedSchema } from '../domain/page'
import { authorSchema } from '../domain/author'
import { tagSchema } from '../domain/tag'
import type { Resource } from '../domain/resource'
import type { Post } from '../domain/post'
import type { Page } from '../domain/page'
import type { Author } from '../domain/author'
import type { Tag } from '../domain/tag'
import type { Result, ID } from '../shared-kernel'

export const entitiesSchema = z.object({
  post: z.record(postNormalizedSchema),
  page: z.record(pageNormalizedSchema),
  author: z.record(authorSchema),
  tag: z.record(tagSchema),
})

export type Entities = z.infer<typeof entitiesSchema>

export const normalize = NeverThrowResult.fromThrowable(_normalize, (error) =>
  Errors.other(
    '`normalizr#normalize`',
    error instanceof Error ? error : undefined
  )
)

export const denormalize = NeverThrowResult.fromThrowable(
  _denormalize,
  (error) =>
    Errors.other(
      '`normalizr#denormalize`',
      error instanceof Error ? error : undefined
    )
)

const resourceEntitySchema = new schema.Entity('resources')
resourceEntitySchema.define({ relationships: [resourceEntitySchema] })

export function denomarlizeResource<T extends Resource>(
  id: ID,
  entities: {
    resources: {
      [id: ID]: Resource
    }
  }
): Result<T> {
  return denormalize(id, resourceEntitySchema, entities)
}

export function denomarlizeResources(resources: Resource[]) {
  const entities = {
    resources: resources.reduce<{ [id: ID]: Resource }>((map, resource) => {
      map[resource.id] = resource
      return map
    }, {}),
  }

  return <T extends Resource>(id: ID) => {
    return denomarlizeResource<T>(id, entities)
  }
}

const tagEntitySchema = new schema.Entity('tags')
const authorEntitySchema = new schema.Entity('authors')
const postEntitySchema = new schema.Entity('posts', {
  authors: [authorEntitySchema],
  tags: [tagEntitySchema],
})
const pageEntitySchema = new schema.Entity('pages', {
  authors: [authorEntitySchema],
  tags: [tagEntitySchema],
})

const entitiesNormalizrSchema = {
  posts: [postEntitySchema],
  pages: [pageEntitySchema],
  tags: [tagEntitySchema],
  authors: [authorEntitySchema],
}

export function normalizeEntity(data: {
  posts: Post[]
  pages: Page[]
  tags: Tag[]
  authors: Author[]
}) {
  return normalize(data, entitiesNormalizrSchema) as Result<
    NormalizedSchema<
      Entities,
      {
        posts: ID[]
        pages: ID[]
        tags: ID[]
        authors: ID[]
      }
    >
  >
}

export function denormalizeEntity(
  data: {
    posts: ID[]
    pages: ID[]
    tags: ID[]
    authors: ID[]
  },
  entities: Entities
) {
  return denormalize(data, entitiesNormalizrSchema, entities) as Result<{
    posts: Post[]
    pages: Page[]
    tags: Tag[]
    authors: Author[]
  }>
}
