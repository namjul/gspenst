import sortOn from 'sort-on'
import type { DataQuery } from '../domain/routes'
import type { Resource } from '../domain/resource'
import { do_, absurd } from '../utils'
import repository from '../repository'
import { combine, okAsync, ok, err } from '../shared-kernel'
import type { ResultAsync } from '../shared-kernel'
import * as api from '../api'
import { createPost } from '../domain/post'
import { createPage } from '../domain/page'
import { createAuthor } from '../domain/author'
import { createTag } from '../domain/tag'
import type { QueryOutcomeRead, QueryOutcomeBrowse } from '../domain/theming'

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
            return combine(
              resources.flatMap((resource) => {
                if (query.filter) {
                  console.log(resource.filters);
                  if (resource.filters?.includes(query.filter)) {
                    return enrichResource(resource)
                  }
                  return []
                }
                return enrichResource(resource)
              })
            )
          })
          .andThen((enrichedResources) => {
            return combine(
              // TODO move into repo#collect
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

                return ok({ resource, entity: entity.value })
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
