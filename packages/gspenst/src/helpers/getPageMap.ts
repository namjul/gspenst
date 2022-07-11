import { filterLocatorResources, filterPageResources } from '../domain/resource'
import type { Resource, LocatorResource } from '../domain/resource'
import type { RoutesConfig } from '../domain/routes'

type FilePath = LocatorResource['filepath']
type Path = LocatorResource['path']
export type RoutingMapping = {
  [filePath: FilePath]: Path
}

export type PageMapItem = {
  type?: 'entry' | 'collection' | 'channel' | 'custom'
  name: string
  route: string
  filepath?: string
  children?: PageMapItem[]
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
        name: resource.filename,
        route: resource.path,
        filepath: resource.filepath,
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
    result.push({ name: route.split('/').join(''), route, children: [] })
  })

  Object.keys(routesConfig.collections ?? {}).forEach((route) => {
    result.push({
      name: route.split('/').join('') || 'index',
      route,
      children: [],
    })
  })

  const pageResources = getLocatorResources(resources)

  return [...result, ...pageResources]

  // const activeRouteLocale = getLocaleFromFilename(currentResourcePath)
  // const pageItem = fileMap[currentResourcePath]
  // const metaPath = path.dirname(currentResourcePath)
  // const metaExtension = activeRouteLocale ? `${activeRouteLocale}.json` : `json`
  // const pageMeta =
  //   fileMap[`${metaPath}/meta.${metaExtension}`]?.meta?.[pageItem.name]
  // const title =
  //   (typeof pageMeta === 'string' ? pageMeta : pageMeta?.title) || pageItem.name
  // if (activeRouteLocale) {
  //   return [
  //     filterRouteLocale(pageMaps, activeRouteLocale, defaultLocale),
  //     fileMap[currentResourcePath].route,
  //     title
  //   ]
  // }
  // return [pageMaps, fileMap[currentResourcePath].route, title]
}

export function getRoutingMapping(pageMap: PageMapItem[]): RoutingMapping {
  return pageMap.reduce((acc, current) => {
    if (current.filepath) {
      return { ...acc, [current.filepath]: current.route }
    }
    return acc
  }, {})
}
