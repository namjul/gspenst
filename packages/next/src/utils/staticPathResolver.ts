import type { RoutingMap } from './routing'

export function resolveStaticPaths(routingMap: RoutingMap, parameter: string) {
  return Object.keys(routingMap.paths).map((path) => {
    return {
      params: {
        [parameter]: path.split('/').filter(Boolean),
      },
    }
  })
}
