import {
  type LocatorResource,
  type AuthorResource,
  type TagResource,
  type PageResource,
  type PostResource,
} from '../domain/resource/resource.locator'
import { ConfigResource } from "../domain/resource/resource.config";
import { type Resource } from "../domain/resource";
import { type RoutesResource } from "../domain/resource/resource.routes";

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

export const isConfigResource = (
  resource: Resource
): resource is ConfigResource => {
  return resource.type === 'config'
}

export const isRoutesResource = (
  resource: Resource
): resource is RoutesResource => {
  return resource.type === 'routes'
}

export const filterLocatorResources = (
  resource: Resource
): resource is LocatorResource => !isConfigResource(resource) && !isRoutesResource(resource)

export const filterTagResources = (
  resource: Resource
): resource is TagResource => isTagResource(resource)

export const filterPageResources = (
  resource: Resource
): resource is PageResource => isPageResource(resource)
