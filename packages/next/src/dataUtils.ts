import type { RoutingContext } from './routing'
import { absurd } from './helpers'

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
      return absurd(type)
  }
}
