import type { ResourceType } from '../domain/resource'
import { resources } from '../__fixtures__/resources'

const repository = {
  async get(id: ID | ID[]) {
    if (!id) {
      return undefined
    }

    const ids = [id].flat()

    const result = Object.fromEntries(ids.map((_id) => [_id, resources[_id]]))

    if (Array.isArray(id)) {
      return result
    }
    return result[id]
  },
  async getAll(resourceType?: ResourceType) {
    if (resourceType) {
      return Object.fromEntries(
        Object.entries(resources).filter(([_, resource]) => {
          return resource.resourceType === resourceType
        })
      )
    }
    return resources
  },
}

export default repository
