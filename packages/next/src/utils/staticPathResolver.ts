import type { RoutingMap } from './routing'

export function resolveStaticPaths(routingMap: RoutingMap, parameter: string) {
  return Object.entries(routingMap).map(([_, properties]) => {
    return {
      params: {
        [parameter]: properties.slug.split('/').filter(Boolean),
      },
    }
  })
}
