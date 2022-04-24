import type { DataQuery } from '../domain/routes'
import { do_, absurd } from '../utils'
import repository from '../repository'
import { combine } from '../shared-kernel'
import { filterResource } from '../helpers/filterResource'

export function processQuery(query: DataQuery) {
  const { type } = query

  const result = do_(() => {
    switch (type) {
      case 'read':
        return repository
          .find({
            slug: query.slug,
          })
          .map(({ dataResult }) => dataResult)
      case 'browse':
        return repository.findAll(query.resourceType).andThen((resources) => {
          return combine(
            resources.map((resource) => filterResource(resource, query.filter))
          ).map((filteredResource) => {
            return filteredResource
              .flatMap(({ resource, owned }) => {
                return owned ? [resource.dataResult] : []
              })
              .slice(0, query.limit)
          })
        })

      default:
        return absurd(type)
    }
  })

  return result
}
