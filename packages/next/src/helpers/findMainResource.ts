import type { LocatorResource } from '../domain/resource'
import type { Entities, Data } from '../domain/theming'

export function findMainResource(
  data: Record<string, Data>,
  entities: Entities
): LocatorResource | undefined {
  return Object.values(data)
    .reverse()
    .flatMap<LocatorResource>((dataSchema) => {
      if (dataSchema.type === 'read') {
        const resource = entities.resources?.[dataSchema.resource]
        if (resource?.resourceType !== 'config') {
          return resource ?? []
        }
      }
      return []
    })
    .at(0)
}
