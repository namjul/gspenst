import merge from 'deepmerge'
import React, { createContext, useContext, useEffect } from 'react'
import { TinaEditProvider, useTina } from 'tinacms/dist/edit-state'
import type { TinaCloudSchema } from 'tinacms'
import { isValidElementType } from 'react-is'
import type { PageThemeContext, ThemeContext } from './domain/theming'
import type { Resource } from './domain/resource'
import { absurd, do_ } from './shared/utils'
import type { Json } from './shared/kernel'
import { normalizeResource, denormalizeEntities } from './helpers/normalize'
import * as Errors from './errors'
import type { PageMapItem, RoutingMapping } from './helpers/getPageMap'
import { getRoutingMapping } from './helpers/getPageMap'
// import { getHeaders } from './helpers/getHeaders';

type Action = { type: 'HYDRATE'; payload: State }
type Dispatch = (action: Action) => void
type State = PageThemeContext & {
  ctxEditingLoading?: boolean
  pageMap: PageMapItem[]
}
type ThemeComponent = React.ComponentType
type DataProviderProps = {
  props: PageThemeContext
  pageMap: PageMapItem[]
  Component: ThemeComponent
  routingMapping: RoutingMapping
}

const DataStateContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined)

function storeReducer(state: State, action: Action) {
  switch (action.type) {
    case 'HYDRATE': {
      return { ...state, ...action.payload }
    }
    default: {
      return absurd(action.type)
    }
  }
}

function useGspenstState(
  initialState: State,
  routingMapping: RoutingMapping
): {
  state: State
  dispatch: Dispatch
} {
  const [state, dispatch] = React.useReducer(storeReducer, initialState)

  const { tinaData } = state.resource

  const { data, isLoading } = useTina({
    query: tinaData.query,
    variables: tinaData.variables,
    data: tinaData.data,
  })

  const resource = {
    ...state.resource,
    tinaData: {
      ...state.resource.tinaData,
      data: { ...state.resource.tinaData.data, ...data },
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
      ctxEditingLoading: isLoading,
      entities: merge(state.entities, normalizeResourceResult.value.entities, {
        isMergeableObject: (value) => {
          return !('type' in value)
        },
      }),
    } as State,
    dispatch,
  }
}

function DataProvider({
  props,
  pageMap,
  Component,
  routingMapping,
}: DataProviderProps) {
  const { state, dispatch } = useGspenstState(
    { ...props, pageMap },
    routingMapping
  )

  useEffect(() => {
    dispatch({ type: 'HYDRATE', payload: { ...props, pageMap } })
  }, [props, pageMap, dispatch]) // dispatch is unnecessary here but my linter still cries. probably needs to be updated

  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = { state, dispatch }

  return React.createElement(DataStateContext.Provider, {
    value,
    children: React.createElement(Component),
  })
}

function useStore() {
  const context = useContext(DataStateContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataStateContext')
  }
  return context
}

function selectData(state: State, key: string | undefined = undefined) {
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

function selectConfig<T extends Json>(state: State) {
  const config = Object.values(state.entities.config).at(0)
  if (config) {
    return config.values as T
  }
}

type WithDataOptions = {
  // Inspiration:
  // https://docs.stackbit.com/how-to-guides/components/add-component/#register_the_component
  // https://github.com/stackbit-themes/starter-nextjs-theme/blob/main/src/components/components-registry.ts
  // https://nextjs.org/docs/advanced-features/dynamic-import
  getComponent: (
    name: 'Admin' | 'TinaProvider'
  ) => React.ComponentType<any> | undefined
  tinaSchema: TinaCloudSchema
  pageMap: PageMapItem[]
}

const withData = (
  Component: ThemeComponent,
  { getComponent, tinaSchema, pageMap }: WithDataOptions
) => {
  if (!isValidElementType(Component)) {
    throw new Error('Theme must export HOC.')
  }

  const routingMapping = getRoutingMapping(pageMap)

  function HOC(props: ThemeContext) {
    let component
    if (props.context === 'internal') {
      const Admin = getComponent('Admin')
      if (Admin) {
        component = React.createElement(Admin)
      }
    } else {
      component = React.createElement(DataProvider, {
        props,
        pageMap,
        Component,
        routingMapping,
      })
    }

    const TinaProvider = getComponent('TinaProvider')

    if (!TinaProvider) {
      throw new Error('Missing TinaProvider')
    }

    return React.createElement(TinaEditProvider, {
      editMode: React.createElement(TinaProvider, {
        tinaSchema,
        routingMapping,
        children: component,
      }),
      children: component,
    })
  }

  HOC.displayName = `withData(${
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    Component.displayName || Component.name || 'Component'
  })`

  return HOC
}
export { withData, useStore, selectData, selectConfig }
