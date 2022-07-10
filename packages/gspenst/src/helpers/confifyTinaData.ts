import * as graphql from 'graphql'
import type { DefinitionNode, SelectionNode } from 'graphql'
import { combine, ok, err } from '../shared/kernel'
import type { Result } from '../shared/kernel'
import * as Errors from '../errors'
import { safeGraphqlParse, safeGraphqlStringify } from '../utils'
import type { Resource, ConfigResource } from '../domain/resource'

export function confifyTinaData(
  configResource: ConfigResource,
  resource: Resource | undefined
): Result<Resource> {
  if (!resource) {
    return ok(configResource)
  }

  if (resource.type === 'config') {
    return err(Errors.other('confifyTinaData: Cannot confify config resource.'))
  }

  return combine([
    safeGraphqlParse(configResource.tinaData.query),
    safeGraphqlParse(resource.tinaData.query),
  ])
    .andThen(([configDocumentNode, resourceDocumentNode]) => {
      if (configDocumentNode && resourceDocumentNode) {
        const { definitions: configDefinitions, selection: configSelection } =
          configDocumentNode.definitions.reduce<{
            definitions: DefinitionNode[]
            selection?: SelectionNode
          }>(
            (acc, definition) => {
              if (definition.kind === graphql.Kind.OPERATION_DEFINITION) {
                const selection = definition.selectionSet.selections[0]
                if (
                  selection &&
                  selection.kind === graphql.Kind.FIELD &&
                  selection.name.value === 'config'
                ) {
                  return {
                    ...acc,
                    selection,
                  }
                }
              }

              return {
                ...acc,
                definitions: [...acc.definitions, definition],
              }
            },
            { definitions: [] }
          )

        if (configSelection) {
          const resourceDefinitions = resourceDocumentNode.definitions
            .map((definition) => {
              if (
                definition.kind === graphql.Kind.OPERATION_DEFINITION &&
                definition.operation === 'query'
              ) {
                return {
                  ...definition,
                  selectionSet: {
                    ...definition.selectionSet,
                    selections: definition.selectionSet.selections.concat([
                      configSelection,
                    ]),
                  },
                }
              }

              return definition
            })
            .concat(configDefinitions)
          return ok({
            ...resourceDocumentNode,
            definitions: resourceDefinitions,
          })
        }
        return err(
          Errors.validation({
            message: 'Missing graphql selection from configResource',
          })
        )
      }
      return err(
        Errors.absurd(
          'configDocumentNode && resourceDocumentNode should be defined'
        )
      )
    })
    .andThen((value) => {
      return safeGraphqlStringify(value)
    })
    .map((query) => {
      // TODO maybe should not me modified, keep it immutable
      resource.tinaData.data.config = configResource.tinaData.data.config
      resource.tinaData.query = query
      return resource
    })
}
