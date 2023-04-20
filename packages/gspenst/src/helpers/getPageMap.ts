import {
  filterLocatorResources,
  filterPageResources,
} from '../helpers/resource'
import {
  type Resource,
  type LocatorResource,
  type LocatorResourceType,
} from '../domain/resource'
import { type RoutesConfig } from '../domain/routes'
import { type RouteType } from '../domain/routing'

type FilePath = LocatorResource['filepath']
type Path = LocatorResource['path']
export type RoutingMapping = {
  [filePath: FilePath]: Path
}

export type PageMapItem = {
  type: RouteType
  name: string
  route: string
  filepath?: string
  children?: PageMapItem[]
  resourceType?: LocatorResourceType
  // locale?: string
  // timestamp?: number
  // frontMatter?: Record<string, any>
  // meta?: Record<string, any>
  // active?: boolean
}

function getLocatorResources(resources: Resource[] = []): PageMapItem[] {
  return resources.flatMap((resource) => {
    if (filterLocatorResources(resource)) {
      return {
        type: 'entry',
        name: resource.filename,
        route: resource.path,
        filepath: resource.filepath,
        resourceType: resource.type,
        children: filterPageResources(resource)
          ? getLocatorResources(
              resources.filter(({ breadcrumbs, id }) => {
                return (
                  breadcrumbs.join().startsWith(resource.breadcrumbs.join()) &&
                  id !== resource.id
                )
              })
            )
          : [],
      }
    }
    return []
  })
}

//TODO rebuild only with acces to repository
export function getPageMap(
  resources: Resource[],
  routesConfig: RoutesConfig
  // currentResourcePath: string,
  // pageMaps: PageMapItem[],
  // fileMap: Record<string, PageMapItem>,
  // defaultLocale: string
): PageMapItem[] {
  const result: PageMapItem[] = []
  Object.keys(routesConfig.routes ?? {}).forEach((route) => {
    result.push({
      type: 'custom',
      name: route.split('/').join(''),
      route,
      children: [],
    })
  })

  Object.keys(routesConfig.collections ?? {}).forEach((route) => {
    result.push({
      type: 'collection',
      name: route.split('/').join('') || 'index',
      route,
      children: [],
    })
  })

  const pageResources = getLocatorResources(resources)

  return [...result, ...pageResources]
}

export function getRoutingMapping(pageMap: PageMapItem[] = []) {
  const result: RoutingMapping = {}
  for (let i = 0, len = pageMap.length; i < len; i++) {
    const current = pageMap[i]
    if (current?.filepath) {
      result[current.filepath] = current.route
    }
  }
  return result
}
