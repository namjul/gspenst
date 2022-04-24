import sortOn from 'sort-on'
import type { DataQuery } from '../domain/routes'
import type { Resource } from '../domain/resource'
import { do_, absurd } from '../utils'
import repository from '../repository'
import { combine } from '../shared-kernel'
import type { ResultAsync } from '../shared-kernel'
import { filterResource } from '../helpers/filterResource'

const POST_PER_PAGE = 5

type Pagination = {
  page: number // the current page number
  prev: number | null // the previous page number
  next: number | null // the next page number
  pages: number // the number of pages available
  total: number // the number of posts available
  limit: number | 'all' // the number of posts per page
}

export type QueryOutcome =
  | {
      type: 'read'
      resource: Resource
    }
  | {
      type: 'browse'
      pagination: Pagination
      resources: Resource[]
    }

type QueryOutcomeResult = ResultAsync<QueryOutcome>

export function processQuery(query: DataQuery): QueryOutcomeResult {
  const { type } = query

  const result = do_(() => {
    switch (type) {
      case 'read':
        return repository
          .find({
            slug: query.slug,
          })
          .map((resource) => ({ type, resource }))
      case 'browse':
        return repository.findAll(query.resourceType).andThen((resources) => {
          return combine(
            resources.map((resource) => filterResource(resource, query.filter))
          ).map((flaggedResources) => {
            const property = query.order?.map((y) => {
              return `${y.order === 'desc' ? '-' : ''}object.${y.field}`
            })

            // filter
            const filteredResources = flaggedResources.filter(
              ({ owned }) => owned
            )

            const sortedResources =
              // sort
              property ? sortOn(filteredResources, property) : filteredResources

            const limit = query.limit ?? POST_PER_PAGE
            const page = query.page ?? 1
            const total = sortedResources.length
            let pages = 1
            let start = 0
            let end
            let prev = null
            let next = null

            if (limit !== 'all') {
              pages = Math.floor(total / limit)
              start = limit * (page - 1)
              end = start + limit
              prev = start > 0 ? page - 1 : null
              next = start > 0 ? page - 1 : null
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
        })

      default:
        return absurd(type)
    }
  })

  return result
}
