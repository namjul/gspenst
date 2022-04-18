import { ok, err } from 'neverthrow'
import { compile, pathToRegexp } from 'path-to-regexp'
import type { Result, ResourceItem } from './types'
import * as Errors from './errors'

export function absurd(_: never): never {
  throw new Error('absurd')
}

export function compilePermalink(
  permalink: string,
  resourceItem: ResourceItem
): Result<string> {
  try {
    // TODO use Result.fromThrowable https://github.com/supermacro/neverthrow#resultfromthrowable-static-class-method
    return ok(compile(permalink)(resourceItem))
  } catch (error: unknown) {
    return err(
      Errors.other(
        '`path-to-regexp`#compile',
        error instanceof Error ? error : undefined
      )
    )
  }
}

export function permalinkToRegexp(permalink: string): Result<RegExp> {
  try {
    return ok(pathToRegexp(permalink))
  } catch (error: unknown) {
    return err(
      Errors.other(
        '`path-to-regexp`#pathToRegexp',
        error instanceof Error ? error : undefined
      )
    )
  }
}

export function formatError(error: Errors.GspenstError) {
  const { type } = error
  switch (type) {
    case 'Other':
      if (error.error) {
        return new Error(`${error.type}: ${error.context}`, {
          cause: error.error,
        })
      }
      return new Error(`${error.type}: ${error.context}`)
    case 'Validation':
      return new Error(
        `${error.type}: ${error.message}${error.help ? `\n${error.help}` : ''}`
      )
    case 'NotFound':
      return new Error(`${error.type}: ${error.context}`)
    default:
      return absurd(type)
  }
}

// export const safeJsonParse = ResultInternal.fromThrowable(
//   JSON.parse,
//   (error: unknown) =>
//     Errors.other('JSON.parse', error instanceof Error ? error : undefined)
// )
//
// export const safeJsonStringify = ResultInternal.fromThrowable(
//   JSON.stringify,
//   (error: unknown) =>
//     Errors.other('JSON.stringify', error instanceof Error ? error : undefined)
// )
