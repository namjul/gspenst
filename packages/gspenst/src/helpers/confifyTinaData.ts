import * as graphql from 'graphql'
import { type DefinitionNode, type SelectionNode } from 'graphql'
import { type Result, combine, ok, err } from '../shared/kernel'
import * as Errors from '../errors'
import { safeGraphqlParse, safeGraphqlStringify } from '../utils'
import { type LocatorResource } from '../domain/resource/resource.locator'
import { type ConfigResource } from "../domain/resource/resource.config";

export function confifyTinaData(
  configResource: ConfigResource,
  resource: LocatorResource | undefined
): Result<LocatorResource | ConfigResource> {

  if (!resource) {
    // TODO should not this return err?
    return ok(configResource)
  }

  return combine([
    safeGraphqlParse(configResource.data.query),
    safeGraphqlParse(resource.data.query),
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
      resource.data.data.config = configResource.data.data.config
      resource.data.query = query
      return resource
    })
}
