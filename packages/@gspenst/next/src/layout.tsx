import { ReactElement, useReducer, useEffect } from 'react'
import merge from 'deepmerge'
import {
  type ThemeContext,
  type Resource,
  type PageMapItem,
  getRoutingMapping,
  normalizeResource,
  Errors,
} from 'gspenst'
import { useTina } from 'tinacms/dist/react'
import { useInternals } from './use-internals'
import { assertUnreachable } from "./utils";

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

  const { resource } = state

  useEffect(() => {
    dispatch({ type: 'HYDRATE', payload: context })
  }, [context])

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

export default function Gspenst(props: ThemeContext): ReactElement {
  const { Layout, pageMap } = useInternals()

  if (props.resource.type === 'routes') {
    throw new Error('routes resource should not land on client')
  }

  const { data } = props.resource

  const { data: tinaData } = useTina({
    query: data.query,
    variables: data.variables,
    data: data.data,
  })

  const resource = {
    ...props.resource,
    data: {
      ...data,
      data: { ...data.data, ...tinaData },
    },
  } as Resource

  const context = { ...props, resource }

  const { state } = useGspenstState(context, pageMap)

  return <Layout context={state} pageMap={pageMap} />
}
