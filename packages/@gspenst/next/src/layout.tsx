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
import { useTina, useEditState } from 'tinacms/dist/react'
import { useInternals } from './use-internals'
import { type ContextNew } from './types'
import { log } from './logger'

function useThemeContext(context: ThemeContext, pageMap: PageMapItem[]) {
  const { resource } = context
  if (resource.type === 'routes') {
    throw new Error('routes resource should not land on client')
  }

  const { edit } = useEditState()

  // TODO fix useTina usage which keeps reference to old state
  // @ts-expect-error --- TODO fix `data.data.config` can be nullable
  const { data: tinaData } = useTina(resource.data)

  const contextMapped = useMemo(() => {
    const resourceWithTinaData = edit
      ? {
          ...resource,
          data: {
            ...resource.data,
            data: {
              ...resource.data.data,
              ...tinaData,
            },
          },
        }
      : resource

    // normalize resource after tinacms consumption
    const routingMapping = getRoutingMapping(pageMap)
    const normalizedResourceResult = normalizeResource(
      // @ts-expect-error --- TODO fix `data.data.config` can be nullable
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
  }, [context, tinaData, pageMap, resource, edit])

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

  log('Theme Context: ', contextNew)

  return <Layout context={contextNew} pageMap={pageMap} />
}
