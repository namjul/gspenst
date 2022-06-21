import type { RoutingContext } from '../domain/routing'

export function getContext(routingContext: RoutingContext) {
  if (routingContext.type === 'entry') {
    return [routingContext.resourceType]
  }

  const contextFromName =
    'name' in routingContext ? [routingContext.name] : null

  const contextFromData =
    'data' in routingContext ? Object.keys(routingContext.data ?? {}) : []

  return contextFromData.length ? contextFromData : contextFromName
}
