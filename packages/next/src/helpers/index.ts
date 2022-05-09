import _nql from '@tryghost/nql'
import { compile, pathToRegexp as _pathToRegexp } from 'path-to-regexp' // TODO use https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#pattern_syntax
import { Result as NeverThrowResult } from 'neverthrow'
import { ok, err } from '../shared-kernel'
import type { Result } from '../shared-kernel'
import type { DynamicVariables } from '../domain/resource'
import * as Errors from '../errors'

import { nodeEnvironment } from '../env'

export const isProductionBuild = nodeEnvironment === 'production'

export const pathToRegexp = NeverThrowResult.fromThrowable(
  _pathToRegexp,
  (error) =>
    Errors.other('`path-to-regexp`', error instanceof Error ? error : undefined)
)

export function compilePermalink(
  permalink: string,
  dynamicVariables: DynamicVariables
): Result<string> {
  try {
    // TODO use Result.fromThrowable https://github.com/supermacro/neverthrow#resultfromthrowable-static-class-method
    return ok(compile(permalink)(dynamicVariables))
  } catch (error: unknown) {
    console.log(permalink, dynamicVariables, error);
    return err(
      Errors.other(
        '`path-to-regexp`#compile',
        error instanceof Error ? error : undefined
      )
    )
  }
}


const EXPANSIONS = [
  {
    key: 'author',
    replacement: 'authors.slug',
  },
  {
    key: 'tags',
    replacement: 'tags.slug',
  },
  {
    key: 'tag',
    replacement: 'tags.slug',
  },
  {
    key: 'authors',
    replacement: 'authors.slug',
  },
  {
    key: 'primary_tag',
    replacement: 'primary_tag.slug',
  },
  {
    key: 'primary_author',
    replacement: 'primary_author.slug',
  },
]

// TODO cache filter
export function makeNqlFilter(filter: string) {
  return NeverThrowResult.fromThrowable(
    (obj: object) => {
      return _nql(filter, { expansions: EXPANSIONS }).queryJSON(obj)
    },
    (error) =>
      Errors.other(
        '`nql`#queryJSON',
        error instanceof Error ? error : undefined
      )
  )
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
