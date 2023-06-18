import sortOn from 'sort-on'
import {
  Result,
  ok,
  err,
  assertUnreachable,
  type GspenstResultAsync,
} from './shared/kernel'
import { type Resource, type ResourceType } from './domain/resource'
import { dynamicVariablesSchema } from './domain/resource/resource.locator'
import { type DataQuery } from './domain/routes'
import { type Pagination } from './domain/theming'
import { type NormalizedEntities } from './domain/entity'
import { removeNullish } from './shared/utils'
import repository from './repository'
import * as Errors from './errors'
import { parse } from './helpers/parser'
import {
  normalizeResource,
  normalizeResources,
  resolveResourceData,
} from './helpers/normalize'
import { DataLoaders } from "./dataLoader";

export type QueryOutcomeRead = {
  type: 'read'
  resourceType: ResourceType
  resource: Resource
  entities: NormalizedEntities
}

export type QueryOutcomeBrowse = {
  type: 'browse'
  resourceType: ResourceType
  pagination: Pagination
  resources: Resource[]
  entities: NormalizedEntities
}

export type QueryOutcome = QueryOutcomeRead | QueryOutcomeBrowse

type ResultAsyncQueryOutcome<T> = T extends Extract<DataQuery, { type: 'read' }>
  ? GspenstResultAsync<Extract<QueryOutcome, { type: 'read' }>>
  : GspenstResultAsync<Extract<QueryOutcome, { type: 'browse' }>>

export function processQuery<T extends DataQuery>(
  dataLoaders: DataLoaders,
  query: T
): ResultAsyncQueryOutcome<T>
export function processQuery(
  dataLoaders: DataLoaders,
  query: DataQuery
): GspenstResultAsync<QueryOutcome> {
  const { loadResource, loadManyResource } =  dataLoaders

  const { type } = query

  switch (type) {
    case 'read':
      return parse(dynamicVariablesSchema.partial(), query).asyncAndThen(
        (dynamicVariables) => {
          return repository
            .find({ metadata: removeNullish(dynamicVariables) })
            .andThen(loadResource)
            .andThen((resource) => {
              return normalizeResource(resource).andThen(({ entities }) => {
                const queryOutcomeRead: QueryOutcomeRead = {
                  type,
                  resourceType: query.resourceType,
                  resource,
                  entities,
                }
                return ok(queryOutcomeRead)
              })
            })
        }
      )
    case 'browse': {
      const limit = query.limit
      const page = limit === 'all' ? 1 : query.page ?? 1

      return repository
        .findAll(query.resourceType)
        .andThen((resources) => {
          // 1. apply filter
          const filteredResources = resources.flatMap((resource) => {
            if (query.filter) {
              if (resource.metadata.filters.includes(query.filter)) {
                return resource
              }
              return []
            }
            return resource
          })

          return Result.combine(
            filteredResources.map((resource) => resolveResourceData(resource))
          )
            .map((x) => x.flat())
            .map((entityList) => {
              const property = query.order?.map((orderValue) => {
                return `${orderValue.order === 'desc' ? '-' : ''}${
                  orderValue.field
                }`
              })
              // 2. apply sorting
              return property ? sortOn(entityList, property) : entityList
            })
            .map((sortedEntityList) => {
              return sortedEntityList.flatMap((entity) => {
                return (
                  filteredResources.find(
                    (resource) => resource.id === entity.id
                  ) ?? []
                )
              })
            })
            .map((entityResultList) => {
              let start = 0
              let end: number | undefined

              if (limit !== 'all') {
                start = (page - 1) * limit
                end = start + limit
              }

              return {
                // 3. apply limit
                resources: entityResultList.slice(start, end),
                total: entityResultList.length,
                start,
                end,
              }
            })
        })
        .andThen(({ resources, ...rest }) =>
          loadManyResource(resources).map((loadedResources) => {
            return { ...rest, resources: loadedResources }
          })
        )
        .andThen(({ resources, ...rest }) =>
          normalizeResources(resources).map(({ result, entities }) => {
            return { result, entities, resources, ...rest }
          })
        )
        .andThen(({ entities, resources, total, start, end }) => {
          const entityResourcesResult = Result.combine(
            resources.map((resource) => {
              if (resource.type === 'routes') {
                return err(
                  Errors.other(`Routes resource should not be processed`)
                )
              }

              const entity = entities[resource.type][resource.id]
              return ok({
                resource,
                entity,
              })
            })
          )

          if (entityResourcesResult.isErr()) {
            return err(entityResourcesResult.error)
          }

          const entityResources = entityResourcesResult.value

          let pages = 1
          let prev: number | null = null
          let next: number | null = null

          if (limit !== 'all') {
            pages = Math.floor(total / limit)
            start = (page - 1) * limit
            end = start + limit
            prev = start > 0 ? page - 1 : null
            next = end < entityResources.length ? page + 1 : null
          }

          return ok({
            type,
            pagination: {
              total,
              limit,
              pages,
              page,
              prev,
              next,
            },
            resources,
            resourceType: query.resourceType,
            entities,
          })
        })
    }

    default:
      return assertUnreachable(type)
  }
}
