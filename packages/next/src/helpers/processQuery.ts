import sortOn from 'sort-on'
import { Result as NeverThrowResult } from 'neverthrow'
import _nql from '@tryghost/nql'
import type { DataQuery } from '../domain/routes'
import type { Resource } from '../domain/resource'
import { do_, absurd } from '../utils'
import repository from '../repository'
import { combine, okAsync, ok, err } from '../shared-kernel'
import type { ResultAsync } from '../shared-kernel'
import * as api from '../api'
import * as Errors from '../errors'
import { createPost } from '../domain/post'
import { createPage } from '../domain/page'
import { createAuthor } from '../domain/author'
import { createTag } from '../domain/tag'

type Pagination = {
  page: number // the current page number
  prev: number | null // the previous page number
  next: number | null // the next page number
  pages: number // the number of pages available
  total: number // the number of posts available
  limit: number | 'all' // the number of posts per page
}

const enrichResource = (resource: Resource) => {
  return do_(() => {
    const { resourceType, relativePath } = resource
    switch (resourceType) {
      case 'page':
        return resource.tinaData
          ? okAsync({ ...resource, tinaData: resource.tinaData })
          : api
              .getPage({ relativePath })
              .map((tinaData) => ({ ...resource, tinaData }))
      case 'post':
        return resource.tinaData
          ? okAsync({ ...resource, tinaData: resource.tinaData })
          : api
              .getPost({ relativePath })
              .map((tinaData) => ({ ...resource, tinaData }))
      case 'author':
        return resource.tinaData
          ? okAsync({ ...resource, tinaData: resource.tinaData })
          : api
              .getAuthor({ relativePath })
              .map((tinaData) => ({ ...resource, tinaData }))
      case 'tag':
        return resource.tinaData
          ? okAsync({ ...resource, tinaData: resource.tinaData })
          : api
              .getTag({ relativePath })
              .map((tinaData) => ({ ...resource, tinaData }))
      default:
        return absurd(resourceType)
    }
  })
    .map((enrichedResource) =>
      repository.set(enrichedResource).map(() => enrichedResource)
    )
    .andThen((x) => x)
}

const EXPANSIONS = [
  {
    key: 'author',
    replacement: 'authors.slug',
  },
  {
    key: 'tags',
    replacement: 'tags.slug',
  },
  {
    key: 'tag',
    replacement: 'tags.slug',
  },
  {
    key: 'authors',
    replacement: 'authors.slug',
  },
  {
    key: 'primary_tag',
    replacement: 'primary_tag.slug',
  },
  {
    key: 'primary_author',
    replacement: 'primary_author.slug',
  },
]

function makeNqlFilter(filter: string) {
  return NeverThrowResult.fromThrowable(
    (obj: object) => {
      return _nql(filter, { expansions: EXPANSIONS }).queryJSON(obj)
    },
    (error) =>
      Errors.other(
        '`nql`#queryJSON',
        error instanceof Error ? error : undefined
      )
  )
}

type QueryOutcomeRead = {
  type: 'read'
  resource: Resource
}
type QueryOutcomeBrowse = {
  type: 'browse'
  pagination: Pagination
  resources: Resource[]
}

export type QueryOutcome = QueryOutcomeRead | QueryOutcomeBrowse

type ResultAsyncQueryOutcome<T> = T extends Extract<DataQuery, { type: 'read' }>
  ? ResultAsync<QueryOutcomeRead>
  : ResultAsync<QueryOutcomeBrowse>

export function processQuery<T extends DataQuery>(
  query: T
): ResultAsyncQueryOutcome<T>
export function processQuery(
  query: DataQuery
): ResultAsync<QueryOutcomeRead> | ResultAsync<QueryOutcomeBrowse> {
  const { type } = query

  const result = do_(() => {
    switch (type) {
      case 'read':
        return repository
          .find({
            slug: query.slug,
          })
          .andThen(enrichResource)
          .map((resource) => ({ type, resource }))
      case 'browse':
        return repository
          .findAll(query.resourceType)
          .andThen((resources) => {
            return combine(resources.map(enrichResource))
          })
          .andThen((enrichedResources) => {
            const nqlFilter = query.filter
              ? makeNqlFilter(query.filter)
              : () => ok(true)

            return combine(
              enrichedResources.flatMap((resource) => {
                const entity = do_(() => {
                  const { resourceType } = resource
                  switch (resourceType) {
                    case 'post':
                      return createPost(resource.tinaData.data.post)
                    case 'page':
                      return createPage(resource.tinaData.data.page)
                    case 'author':
                      return createAuthor(resource.tinaData.data.author)
                    case 'tag':
                      return createTag(resource.tinaData.data.tag)
                    default:
                      return absurd(resourceType)
                  }
                })

                if (entity.isErr()) {
                  return err(entity.error)
                }

                const filterResult = nqlFilter(entity.value)
                if (filterResult.isErr()) {
                  return err(filterResult.error)
                }
                return filterResult.isOk() && filterResult.value
                  ? ok({ resource, entity: entity.value })
                  : []
              })
            )
          })
          .map((filteredResources) => {
            const property = query.order?.map((orderValue) => {
              return `${orderValue.order === 'desc' ? '-' : ''}entity.${
                orderValue.field
              }`
            })

            const sortedResources = property
              ? sortOn(filteredResources, property)
              : filteredResources

            const limit = query.limit
            const total = sortedResources.length
            let page = query.page ?? 1
            let pages = 1
            let start = 0
            let end
            let prev = null
            let next = null

            if (limit === 'all') {
              page = 1
            } else {
              pages = Math.floor(total / limit)
              start = (page - 1) * limit
              end = start + limit
              prev = start > 0 ? page - 1 : null
              next = end < sortedResources.length ? page + 1 : null
            }

            return {
              type,
              pagination: {
                total,
                limit,
                pages,
                page,
                prev,
                next,
              },
              resources: sortedResources
                .slice(start, end)
                .map(({ resource }) => resource),
            }
          })

      default:
        return absurd(type)
    }
  })

  return result
}
