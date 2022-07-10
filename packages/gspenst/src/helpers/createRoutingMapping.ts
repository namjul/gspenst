import type { LocatorResource } from '../domain/resource'

type FilePath = LocatorResource['filepath']
type Path = LocatorResource['path']
export type RoutingMapping = {
  [filePath: FilePath]: Path
}
export function createRoutingMapping(
  locatorResources: LocatorResource[]
): RoutingMapping {
  return locatorResources.reduce<RoutingMapping>((acc, resource) => {
    return {
      ...acc,
      [resource.filepath]: resource.path,
    }
  }, {})
}
