import type { ResourceItem } from './types'
import type { RoutingContext } from './routing'
import { assertUnreachable } from './helpers'

export function find<T extends ResourceItem>(
  resources: T[],
  partialResourceItem: Partial<T>
): T | undefined {
  return Object.values(resources).find(
    (resourceItem) =>
      (partialResourceItem.resourceType
        ? partialResourceItem.resourceType === resourceItem.resourceType
        : true) &&
      Object.entries(partialResourceItem)
        .map(([key, value]) => {
          return (
            String(resourceItem[key as keyof typeof partialResourceItem]) ===
            String(value)
          )
        })
        .every(Boolean)
  )
}

export function getTemplateHierarchy(
  routingProperties: NonNullable<RoutingContext>
) {
  const { type } = routingProperties
  const templateList: string[] = []

  switch (type) {
    case 'collection':
    case 'channel':
    case 'custom':
      templateList.push('index')

      // CASE: author, tag, custom collection/channel name
      if ('name' in routingProperties && routingProperties.name !== 'index') {
        templateList.unshift(routingProperties.name)

        if (routingProperties.request.params?.slug) {
          templateList.unshift(
            `${routingProperties.name}-${routingProperties.request.params.slug}`
          )
        }
      }

      // CASE: collections/channels can define a template list
      routingProperties.templates.forEach((template) => {
        if (!templateList.includes(template)) {
          templateList.unshift(template)
        }
      })

      return templateList
    case 'entry':
      templateList.push('post')

      if (routingProperties.resourceType === 'page') {
        templateList.unshift('page')
      }

      templateList.unshift(
        `${routingProperties.resourceType === 'page' ? 'page' : 'post'}-${
          routingProperties.request.params?.slug
        }`
      ) // slugTemplate

      // TODO add customTemplate

      return templateList
    case 'internal':
      throw new Error('Should not reach this part.')
    case 'redirect':
      throw new Error('Should not reach this part.')

    default:
      return assertUnreachable(type)
  }
}
