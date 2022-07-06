import merge from 'deepmerge'
import React, { createContext, useContext } from 'react'
import { TinaEditProvider, useTina } from 'tinacms/dist/edit-state'
import type { TinaCloudSchema } from 'tinacms'
import { isValidElementType } from 'react-is'
import type { PageThemeContext, ThemeContext } from './domain/theming'
import type { Resource, RoutingMapping } from './domain/resource'
import { absurd } from './shared/utils'
import { normalizeResource } from './helpers/normalize'
import * as Errors from './errors'

type Action = { type: 'to-be-defined' }
type Dispatch = (action: Action) => void
type State = PageThemeContext & { ctxEditingLoading?: boolean }
type ThemeComponent = React.ComponentType<State>
type DataProviderProps = { initialState: State; Component: ThemeComponent }

const DataStateContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined)

function dataReducer(state: State, action: Action) {
  switch (action.type) {
    case 'to-be-defined': {
      return state
    }
    default: {
      return absurd(action.type)
    }
  }
}

function useGspenstState(initialState: State): {
  state: State
  dispatch: Dispatch
} {
  const [state, dispatch] = React.useReducer(dataReducer, initialState)

  const { tinaData } = state.resource

  const { data, isLoading } = useTina({
    query: tinaData.query,
    variables: tinaData.variables,
    data: tinaData.data,
  })

  const resource = {
    ...state.resource,
    tinaData: { ...state.resource.tinaData, data },
  } as Resource

  const normalizeResourceResult = normalizeResource(resource)

  if (normalizeResourceResult.isErr()) {
    throw Errors.format(normalizeResourceResult.error)
  }

  return {
    state: {
      ...state,
      resource,
      ctxEditingLoading: isLoading,
      entities: merge(state.entities, normalizeResourceResult.value.entities),
    } as State,
    dispatch,
  }
}

function DataProvider({ initialState, Component }: DataProviderProps) {
  const { state, dispatch } = useGspenstState(initialState)

  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = { state, dispatch }

  return React.createElement(DataStateContext.Provider, {
    value,
    children: React.createElement(Component, value.state),
  })
}

function useData() {
  const context = useContext(DataStateContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataStateContext')
  }
  return context
}

const withData = ({
  getComponent,
  config,
  Component,
}: {
  // Inspiration:
  // https://docs.stackbit.com/how-to-guides/components/add-component/#register_the_component
  // https://github.com/stackbit-themes/starter-nextjs-theme/blob/main/src/components/components-registry.ts
  // https://nextjs.org/docs/advanced-features/dynamic-import
  getComponent: (
    name: 'Admin' | 'TinaProvider'
  ) => React.ComponentType<any> | undefined
  config: {
    tinaSchema: TinaCloudSchema
    routingMapping: RoutingMapping
  }
  Component: ThemeComponent
}) => {
  if (!isValidElementType(Component)) {
    throw new Error('Theme must export HOC.')
  }

  function WithData(props: ThemeContext) {
    let component
    if (props.context === 'internal') {
      const Admin = getComponent('Admin')
      if (Admin) {
        component = React.createElement(Admin)
      }
    } else {
      component = React.createElement(DataProvider, {
        initialState: props,
        Component,
      })
    }

    const TinaProvider = getComponent('TinaProvider')

    if (!TinaProvider) {
      throw new Error('Missing TinaProvider')
    }

    return React.createElement(TinaEditProvider, {
      editMode: React.createElement(TinaProvider, {
        config,
        children: component,
      }),
      children: component,
    })
  }
  return WithData
}
export { withData, useData }
