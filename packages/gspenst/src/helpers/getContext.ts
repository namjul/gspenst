import { type RoutingContext } from '../domain/routing'

export function getContext(routingContext: RoutingContext) {
  const contextType =
    routingContext.type === 'entry'
      ? [routingContext.resourceType]
      : ['channel', 'collection'].includes(routingContext.type)
      ? ['index']
      : []

  const contextFromName =
    'name' in routingContext && routingContext.name ? [routingContext.name] : []

  const contextFromData =
    'data' in routingContext ? Object.keys(routingContext.data) : []

  return [
    ...new Set([
      ...(contextFromData.length ? contextFromData : contextFromName),
      ...contextType,
    ]),
  ]
}
