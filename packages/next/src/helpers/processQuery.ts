import sortOn from 'sort-on'
import type { DataQuery } from '../domain/routes'
import type { GetPost } from '../domain/post'
import type { GetPage } from '../domain/page'
import type { GetAuthor } from '../domain/author'
import type { GetTag } from '../domain/tag'
import { do_, absurd } from '../utils'
import repository from '../repository'
import { combine, ok, err } from '../shared-kernel'
import type { ResultAsync } from '../shared-kernel'
import { filterResource } from '../helpers/filterResource'
import * as Errors from '../errors'

const POST_PER_PAGE = 5

type GetResource = GetPost | GetPage | GetAuthor | GetTag

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
      tinaData: GetResource
    }
  | {
      type: 'browse'
      pagination: Pagination
      tinaData: GetResource[]
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
          .andThen(({ tinaData }) =>
            tinaData === undefined
              ? err(Errors.notFound('processQuery'))
              : ok({ type, tinaData })
          )
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
              (
                property
                  ? sortOn(filteredResources, property)
                  : filteredResources
              ).flatMap(({ resource }) => {
                return resource.tinaData ? [resource.tinaData] : []
              })

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
              tinaData: sortedResources.slice(start, end),
            }
          })
        })

      default:
        return absurd(type)
    }
  })

  return result
}
