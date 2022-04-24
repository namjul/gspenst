import sortOn from 'sort-on'
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
          ).map((x) => {
            const property = query.order?.map((y) => {
              return `${y.order === 'desc' ? '-' : ''}object.${y.field}`
            })

            // filter
            const filteredResource = x.filter(({ owned }) => owned)

            return (
              // order
              (property ? sortOn(filteredResource, property) : filteredResource)
                // limit
                .slice(0, query.limit)
                // map
                .flatMap(({ resource }) => {
                  return resource.dataResult ? [resource.dataResult] : []
                })
            )
          })
        })

      default:
        return absurd(type)
    }
  })

  return result
}
