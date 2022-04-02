import slugify from 'slugify'
import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import type { ResourceType, ResourceItem } from './types'
import type { RoutingProperties } from './routing'
import { assertUnreachable } from './helpers'

export function find(
  resources: ResourceItem[],
  partialResourceItem: Partial<ResourceItem>
): ResourceItem | undefined {
  return Object.values(resources).find(
    (resourceItem) =>
      (partialResourceItem.resource
        ? partialResourceItem.resource === resourceItem.resource
        : true) &&
      Object.entries(partialResourceItem)

        .map(([key, value]) => {
          return resourceItem[key as keyof typeof partialResourceItem] === value
        })

        .every(Boolean)
  )
}

export async function getResources() {
  const client = ExperimentalGetTinaClient() // eslint-disable-line new-cap

  const { data } = await client.getResources()

  const { getCollections: resources } = data

  const result = resources.reduce<{ [id: ID]: ResourceItem }>(
    (acc, current) => {
      ;(current.documents.edges ?? []).forEach((connectionEdge) => {
        if (connectionEdge?.node) {
          const {
            id,
            sys: { filename, path: filepath, relativePath },
          } = connectionEdge.node
          acc[id] = {
            id,
            filename,
            path: filepath,
            slug: slugify(filename),
            resource: current.name as ResourceType,
            relativePath,
          }
        }
      }, {})

      return acc
    },
    {}
  )

  return result
}

export function getTemplateHierarchy(routingProperties: RoutingProperties) {
  if (!routingProperties) {
    throw new Error('Missing routing properties.')
  }

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

      if (routingProperties.resourceItem.resource === 'page') {
        templateList.unshift('page')
      }

      templateList.unshift(
        `${
          routingProperties.resourceItem.resource === 'page' ? 'page' : 'post'
        }-${routingProperties.request.slug}`
      ) // slugTemplate

      // TODO add customTemplate

      return templateList
    case 'redirect':
      throw new Error('Should not reach this part.')

    default:
      return assertUnreachable(type)
  }
}
