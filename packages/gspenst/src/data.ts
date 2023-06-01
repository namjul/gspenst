import { type ThemeContext } from './domain/theming'
import { type Json, do_ } from './shared/kernel'
import { denormalizeEntities } from './helpers/normalize'
import * as Errors from './errors'
// import { getHeaders } from './helpers/getHeaders';

export function selectData(
  context: ThemeContext,
  key: string | undefined = undefined
) {
  const { resources, pagination } = do_(() => {
    if (key === context.resource.type || key === undefined) {
      return {
        resources: {
          [context.resource.type]: [context.resource.id],
        },
      }
    }

    const dataEntry = context.data[key]
    if (dataEntry) {
      if (dataEntry.type === 'read') {
        return {
          resources: {
            [dataEntry.resourceType]: [dataEntry.resource],
          },
        }
      }

      return {
        resources: {
          [dataEntry.resourceType]: dataEntry.resources,
        },
        pagination: dataEntry.pagination,
      }
    }
    return {
      resources: {},
    }
  })

  const entitiesDenormalizedResult = denormalizeEntities(
    resources,
    context.entities
  )

  if (entitiesDenormalizedResult.isErr()) {
    throw Errors.format(entitiesDenormalizedResult.error)
  }

  return {
    resources: [...Object.values(entitiesDenormalizedResult.value)].flat(),
    pagination,
  }
}

export function selectConfig<T extends Json>(context: ThemeContext) {
  const config = Object.values(context.entities.config).at(0)
  if (config) {
    return config.values as T
  }
}
