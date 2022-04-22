import { compile, pathToRegexp } from 'path-to-regexp'
import { ok, err } from './shared-kernel'
import type { Result } from './shared-kernel'
import type { Resource } from './domain/resource'
import * as Errors from './errors'
import { nodeEnvironment } from './env'

export function absurd(_: never): never {
  throw new Error('absurd')
}

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

export const isProductionBuild = nodeEnvironment === 'production'

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
