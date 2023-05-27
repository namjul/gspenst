import { ReactElement, useMemo } from 'react'
import merge from 'deepmerge'
import {
  type ThemeContext,
  type PageMapItem,
  getRoutingMapping,
  normalizeResource,
  Errors,
} from 'gspenst'
import { useTina } from 'tinacms/dist/react'
import { useInternals } from './use-internals'

function useContext(context: ThemeContext, pageMap: PageMapItem[]) {
  const { resource } = context
  if (resource.type === 'routes') {
    throw new Error('routes resource should not land on client')
  }

  const { data: tinaData } = useTina({
    query: resource.data.query,
    variables: resource.data.variables,
    data: resource.data.data,
  })

  const resourceEntities = useMemo(() => {
    const routingMapping = getRoutingMapping(pageMap)
    const normalizedResourceResult = normalizeResource(resource, routingMapping)

    if (normalizedResourceResult.isErr()) {
      throw Errors.format(normalizedResourceResult.error)
    }

    return normalizedResourceResult.value.entities
  }, [resource, pageMap])

  return useMemo(() => {
    return {
      ...context,
      resource: {
        ...resource,
        data: {
          ...resource.data,
          data: { ...resource.data.data, ...tinaData },
        },
      },
      entities: merge(context.entities, resourceEntities, {
        isMergeableObject: (value) => {
          return !('type' in value)
        },
      }),
    } as ThemeContext
  }, [tinaData, context, resourceEntities, resource])
}

export default function Gspenst(props: ThemeContext): ReactElement {
  const { Layout, pageMap } = useInternals()

  const context = useContext(props, pageMap)

  console.log("render Layout");

  return <Layout context={context} pageMap={pageMap} />
}
