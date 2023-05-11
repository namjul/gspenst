import path from 'path'
import {
  filterLocatorResources,
  filterPageResources,
  isRoutesResource,
} from '../helpers/resource'
import { type Resource } from '../domain/resource'
import {
  type LocatorResource,
  type LocatorResourceType,
} from '../domain/resource/resource.locator'
import { type RoutesConfig } from '../domain/routes'
import { type RouteType } from '../domain/routing'

type ResourcePath = LocatorResource['path']
type Path = LocatorResource['metadata']['path']
export type RoutingMapping = {
  [resourcePath: ResourcePath]: Path
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
  const locatorResources = resources.filter(filterLocatorResources)
  return locatorResources.map((resource) => {
    return {
      type: 'entry',
      name: path.parse(resource.path).name,
      route: resource.metadata.path,
      filepath: resource.path,
      resourceType: resource.type,
      children: filterPageResources(resource)
        ? getLocatorResources(
            locatorResources.filter(({ metadata: { breadcrumbs }, id }) => {
              return (
                breadcrumbs
                  .join()
                  .startsWith(resource.metadata.breadcrumbs.join()) &&
                id !== resource.id
              )
            })
          )
        : [],
    }
  })
}

export type PageMap = PageMapItem[]

export function getPageMap(
  resources: Resource[]
  // currentResourcePath: string,
  // pageMaps: PageMapItem[],
  // fileMap: Record<string, PageMapItem>,
  // defaultLocale: string
): PageMap {
  const routesResource = resources.find(isRoutesResource)
  const routesConfig: RoutesConfig = routesResource?.data ?? {}

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
