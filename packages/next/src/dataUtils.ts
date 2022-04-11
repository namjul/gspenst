import type { Key } from 'path-to-regexp'
import type { ResourceItem, DynamicVariables } from './types'
import type { RoutingContext } from './routing'
import { assertUnreachable } from './helpers'

// TODO force equal array length https://stackoverflow.com/questions/65361696/arguments-of-same-length-typescript
export function createDynamicVariables(
  dynamicVariables: string[],
  keys: Key[]
) {
  return dynamicVariables.reduce<Partial<DynamicVariables>>(
    (acc, current, index) => {
      const key = keys[index]
      if (key) {
        return {
          [key.name]: current,
          ...acc,
        }
      }
      return acc
    },
    {}
  )
}

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

        if (routingProperties.request.slug) {
          templateList.unshift(
            `${routingProperties.name}-${routingProperties.request.slug}`
          )
        }
      }

      // CASE: collections/channels can define a template list
      routingProperties.templates?.forEach((template) => {
        if (!templateList.includes(template)) {
          templateList.unshift(template)
        }
      })

      return templateList
    case 'entry':
      templateList.push('post')

      if (routingProperties.resourceItem.resourceType === 'page') {
        templateList.unshift('page')
      }

      templateList.unshift(
        `${
          routingProperties.resourceItem.resourceType === 'page'
            ? 'page'
            : 'post'
        }-${routingProperties.request.slug}`
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
