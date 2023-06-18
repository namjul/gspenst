import merge from 'deepmerge'
import {
  ResultAsync,
  assertUnreachable,
  do_,
  type GspenstResultAsync,
  type ID,
} from './shared/kernel'
import { type DataQuery } from './domain/routes'
import { type Data } from './domain/theming'
import { type NormalizedEntities } from './domain/entity'
import { type Resource } from './domain/resource'
import { processQuery } from './processQuery'
import { type DataLoaders } from './dataLoader'

export type ProcessData = {
  data: Record<string, Data>
  entities: NormalizedEntities
  resources: Record<ID, Resource>
}
export function processData(
  dataLoaders: DataLoaders,
  data: { [name: string]: DataQuery } = {}
): GspenstResultAsync<ProcessData> {
  const keys = Object.keys(data)
  const result = ResultAsync.combine(
    keys.map((key) => {
      return processQuery(dataLoaders, data[key]!)
    })
  ).map((outcomes) => {
    return keys.reduce<ProcessData>(
      (acc, current, index) => {
        const queryOutcome = outcomes[index]
        if (!queryOutcome) {
          return acc
        }
        const { entities, ...queryOutcomeRest } = queryOutcome

        const dataBucket = do_(() => {
          const { type } = queryOutcomeRest

          switch (type) {
            case 'read': {
              const { resource, resourceType } = queryOutcomeRest
              return {
                data: {
                  type,
                  resourceType,
                  resource: resource.id,
                },
                resources: [resource],
              }
            }
            case 'browse': {
              const { resources, pagination, resourceType } = queryOutcomeRest
              return {
                data: {
                  type,
                  resourceType,
                  resources: resources.map(({ id }) => id),
                  pagination,
                },
                resources,
              }
            }
            default:
              return assertUnreachable(type)
          }
        })

        return {
          data: {
            ...acc.data,
            [current]: dataBucket.data,
          },
          entities: merge(acc.entities, entities),
          resources: {
            ...acc.resources,
            ...dataBucket.resources.reduce<ProcessData['resources']>(
              (resources, resource) => {
                return {
                  ...resources,
                  [resource.id]: resource,
                }
              },
              {}
            ),
          },
        }
      },
      {
        data: {},
        entities: {
          post: {},
          page: {},
          author: {},
          tag: {},
          config: {},
        },
        resources: {},
      }
    )
  })

  return result
}
