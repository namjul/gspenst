import type { LocatorResource } from '../domain/resource'
import type { Entities, Data } from '../domain/theming'

export function findMainResource(
  data: Record<string, Data>,
  entities: Entities
): LocatorResource | undefined {
  const entries = Object.entries(data).reverse()
  const mainIndex = entries.findIndex(([key]) => key === 'main')

  return entries
    .flatMap<LocatorResource>(([_, dataSchema]) => {
      if (dataSchema.type === 'read') {
        const resource = entities.resources?.[dataSchema.resource]
        if (resource?.resourceType !== 'config') {
          return resource ?? []
        }
      }
      return []
    })
    .at(mainIndex > -1 ? mainIndex : 0)
}
