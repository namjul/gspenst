import { ReactElement, useMemo } from 'react'
import merge from 'deepmerge'
import {
  type ThemeContext,
  type PageMapItem,
  type Entries,
  getRoutingMapping,
  normalizeResource,
  Errors,
} from 'gspenst'
import { selectData } from 'gspenst/data'
import { useTina } from 'tinacms/dist/react'
import { useInternals } from './use-internals'
import { type ContextNew } from './types'

function useThemeContext(context: ThemeContext, pageMap: PageMapItem[]) {
  const { resource } = context
  if (resource.type === 'routes') {
    throw new Error('routes resource should not land on client')
  }

  const { data: tinaData } = useTina(resource.data)

  const contextMapped = useMemo(() => {
    const resourceWithTinaData = {
      ...resource,
      data: {
        ...resource.data,
        data: {
          ...resource.data.data,
          ...tinaData,
        },
      },
    }

    // normalize resource after tinacms consumption
    const routingMapping = getRoutingMapping(pageMap)
    const normalizedResourceResult = normalizeResource(
      resourceWithTinaData,
      routingMapping
    )

    if (normalizedResourceResult.isErr()) {
      throw Errors.format(normalizedResourceResult.error)
    }

    const resourceEntities = normalizedResourceResult.value.entities

    return {
      ...context,
      resource: resourceWithTinaData,
      entities: merge(context.entities, resourceEntities, {
        isMergeableObject: (value) => {
          return !('type' in value)
        },
      }),
    } as ThemeContext
  }, [context, tinaData, pageMap, resource])

  return contextMapped
}

export default function Gspenst(props: ThemeContext): ReactElement {
  const { Layout, pageMap } = useInternals()

  const themeContext = useThemeContext(props, pageMap)

  const contextNew: ContextNew = useMemo(() => {
    const { route, templates, context } = themeContext
    const config = Object.values(themeContext.entities.config).at(0)
    const entry = selectData(themeContext).resources.at(0)

    if (!config) {
      throw new Error('Something went wrong. `config` missing.')
    }

    if (!entry) {
      throw new Error('Something went wrong. `entry` missing.')
    }

    const result = {
      route,
      templates,
      context,
      config,
      entry,
      data: Object.fromEntries(
        (
          Object.entries(themeContext.data) as Entries<typeof themeContext.data>
        ).map(([key]) => {
          return [key, selectData(themeContext, key)]
        })
      ),
    }

    return result
  }, [themeContext])

  return <Layout context={contextNew} pageMap={pageMap} />
}
