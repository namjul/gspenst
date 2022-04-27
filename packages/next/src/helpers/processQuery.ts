import sortOn from 'sort-on'
import type { DataQuery } from '../domain/routes'
import type { Resource } from '../domain/resource'
import { do_, absurd } from '../utils'
import repository from '../repository'
import { combine } from '../shared-kernel'
import type { ResultAsync } from '../shared-kernel'
import { filterResource } from '../helpers/filterResource'
import * as api from '../api'

const POST_PER_PAGE = 5

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
        return api
          .getPage({ relativePath })
          .map((tinaData) => ({ ...resource, tinaData }))
      case 'post':
        return api
          .getPost({ relativePath })
          .map((tinaData) => ({ ...resource, tinaData }))
      case 'author':
        return api
          .getAuthor({ relativePath })
          .map((tinaData) => ({ ...resource, tinaData }))
      case 'tag':
        return api
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
            return combine(
              enrichedResources.map((resource) =>
                filterResource(resource, query.filter)
              )
            )
          })
          .map((flaggedResources) => {
            const property = query.order?.map((y) => {
              return `${y.order === 'desc' ? '-' : ''}object.${y.field}`
            })

            const filteredResources = flaggedResources.filter(
              ({ owned }) => owned
            )

            const sortedResources = property
              ? sortOn(filteredResources, property)
              : filteredResources

            const limit = query.limit ?? POST_PER_PAGE
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
