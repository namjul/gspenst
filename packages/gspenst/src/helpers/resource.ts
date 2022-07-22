import type {
  Resource,
  LocatorResource,
  TagResource,
  PageResource,
} from '../domain/resource'

export const filterLocatorResources = (
  resource: Resource
): resource is LocatorResource => resource.type !== 'config'

export const filterTagResources = (
  resource: Resource
): resource is TagResource => resource.type === 'tag'

export const filterPageResources = (
  resource: Resource
): resource is PageResource => resource.type === 'page'
