import type { RoutingContext } from '../domain/routing'
import { assertUnreachable } from '../shared/utils'

export function getTemplateHierarchy(routingContext: RoutingContext) {
  const { type } = routingContext
  const templateList: string[] = []

  switch (type) {
    case 'collection':
    case 'channel':
    case 'custom':
      templateList.push('index')

      // CASE: author, tag, custom collection/channel name
      if (
        'name' in routingContext &&
        routingContext.name &&
        routingContext.name !== 'index'
      ) {
        templateList.unshift(routingContext.name)

        if (routingContext.request.params?.slug) {
          templateList.unshift(
            `${routingContext.name}-${routingContext.request.params.slug}`
          )
        }
      }

      // CASE: collections/channels can define a template list
      routingContext.templates.forEach((template) => {
        if (!templateList.includes(template)) {
          templateList.unshift(template)
        }
      })

      return templateList
    case 'entry':
      templateList.push('post')

      if (routingContext.resourceType === 'page') {
        templateList.unshift('page')
      }

      templateList.unshift(
        `${routingContext.resourceType === 'page' ? 'page' : 'post'}-${
          routingContext.request.params?.slug
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
