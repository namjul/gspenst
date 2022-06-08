import path from 'path'
import fs from 'fs'
import _nql from '@tryghost/nql'
import { compile, pathToRegexp as _pathToRegexp } from 'path-to-regexp' // TODO use https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#pattern_syntax
import { Result as NeverThrowResult } from 'neverthrow'
import { ok, err } from '../shared-kernel'
import type { Result } from '../shared-kernel'
import type { DynamicVariables, Resource, LocatorResource  } from '../domain/resource'
import * as Errors from '../errors'

import { nodeEnvironment } from '../env'

export const filterLocatorResources = (resource: Resource): resource is LocatorResource => resource.resourceType !== 'config'

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

const cache = new Map<string, ReturnType<typeof _nql>>()
export function makeNqlFilter(filter: string) {
  return NeverThrowResult.fromThrowable(
    (obj: object) => {
      if (cache.has(filter)) {
        return cache.get(filter)!.queryJSON(obj)
      }
      const nqlFilter = _nql(filter, { expansions: EXPANSIONS })
      cache.set(filter, nqlFilter)
      return nqlFilter.queryJSON(obj)
    },
    (error) =>
      Errors.other(
        '`nql`#queryJSON',
        error instanceof Error ? error : undefined
      )
  )
}

export const existsSync = (f: string): boolean => {
  try {
    fs.accessSync(f, fs.constants.F_OK)
    return true
  } catch (e: unknown) {
    return false
  }
}

export function findContentDir(dir: string = process.cwd()): string {
  if (existsSync(path.join(dir, 'content'))) return 'content'

  throw new Error(
    "> Couldn't find a `content` directory. Please create one under the project root"
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
