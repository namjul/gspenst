import { compile, pathToRegexp as _pathToRegexp } from 'path-to-regexp'
import { Result as NeverThrowResult } from 'neverthrow'
import { ok, err } from '../shared-kernel'
import type { Result } from '../shared-kernel'
import type { Resource } from '../domain/resource'
import * as Errors from '../errors'

import { nodeEnvironment } from '../env'

export const isProductionBuild = nodeEnvironment === 'production'

export function absurd(_: never): never {
  throw new Error('absurd')
}

export const pathToRegexp = NeverThrowResult.fromThrowable(
  _pathToRegexp,
  (error) =>
    Errors.other('`path-to-regexp`', error instanceof Error ? error : undefined)
)

export function compilePermalink(
  permalink: string,
  resource: Resource
): Result<string> {
  try {
    // TODO use Result.fromThrowable https://github.com/supermacro/neverthrow#resultfromthrowable-static-class-method
    return ok(compile(permalink)(resource))
  } catch (error: unknown) {
    return err(
      Errors.other(
        '`path-to-regexp`#compile',
        error instanceof Error ? error : undefined
      )
    )
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
