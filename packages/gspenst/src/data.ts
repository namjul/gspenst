import merge from 'deepmerge'
import { useReducer } from 'react'
import { useTina } from 'tinacms/dist/react'
import { type ThemeContext } from './domain/theming'
import { type Resource } from './domain/resource'
import { assertUnreachable, do_ } from './shared/utils'
import { type Json } from './shared/kernel'
import { normalizeResource, denormalizeEntities } from './helpers/normalize'
import * as Errors from './errors'
import {
  type PageMapItem,
  getRoutingMapping
} from './helpers/getPageMap'
// import { getHeaders } from './helpers/getHeaders';

type Action = { type: 'HYDRATE'; payload: State }
type Dispatch = (action: Action) => void
type State = ThemeContext

function storeReducer(state: State, action: Action) {
  switch (action.type) {
    case 'HYDRATE': {
      return { ...state, ...action.payload }
    }
    default: {
      return assertUnreachable(action.type)
    }
  }
}

export function useGspenstState(
  context: ThemeContext,
  pageMap: PageMapItem[]
): {
  state: State
  dispatch: Dispatch
} {
  const routingMapping = getRoutingMapping(pageMap) // TODO memorize
  const [state, dispatch] = useReducer(storeReducer, context)

  if (state.resource.type === 'routes') {
    throw new Error('routes resource should not land on client')
  }

  const { data } = state.resource

  const { data: tinaData } = useTina({
    query: data.query,
    variables: data.variables,
    data: data.data,
  })

  const resource = {
    ...state.resource,
    data: {
      ...data,
      data: { ...data.data, ...tinaData },
    },
  } as Resource

  const normalizeResourceResult = normalizeResource(resource, routingMapping)

  if (normalizeResourceResult.isErr()) {
    throw Errors.format(normalizeResourceResult.error)
  }

  return {
    state: {
      ...state,
      resource,
      entities: merge(state.entities, normalizeResourceResult.value.entities, {
        isMergeableObject: (value) => {
          return !('type' in value)
        },
      }),
    } as State,
    dispatch,
  }
}


export function selectData(state: State, key: string | undefined = undefined) {
  const { resources, pagination } = do_(() => {
    if (key === state.resource.type || key === undefined) {
      return {
        resources: {
          [state.resource.type]: [state.resource.id],
        },
      }
    }

    const dataEntry = state.data[key]
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
    state.entities
  )

  if (entitiesDenormalizedResult.isErr()) {
    throw Errors.format(entitiesDenormalizedResult.error)
  }

  return {
    resources: [...Object.values(entitiesDenormalizedResult.value)].flat(),
    pagination,
  }
}

export function selectConfig<T extends Json>(state: State) {
  const config = Object.values(state.entities.config).at(0)
  if (config) {
    return config.values as T
  }
}

