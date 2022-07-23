import type {
  Resource,
  LocatorResource,
  AuthorResource,
  TagResource,
  PageResource,
  PostResource,
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

export const isPostResource = (
  resource: Resource
): resource is PostResource => {
  return resource.type === 'post'
}

export const isPageResource = (
  resource: Resource
): resource is PageResource => {
  return resource.type === 'page'
}

export const isAuthorResource = (
  resource: Resource
): resource is AuthorResource => {
  return resource.type === 'author'
}

export const isTagResource = (resource: Resource): resource is TagResource => {
  return resource.type === 'tag'
}
