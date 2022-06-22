import path from 'path'
import fs from 'fs'
import * as graphql from 'graphql'
import { normalize as _normalize, denormalize as _denormalize } from 'normalizr'
import _nql from '@tryghost/nql'
import { compile, pathToRegexp as _pathToRegexp } from 'path-to-regexp' // TODO use https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#pattern_syntax
import { ok, err, fromThrowable } from '../shared/kernel'
import type { Result } from '../shared/kernel'
import type {
  DynamicVariables,
  Resource,
  LocatorResource,
  TagResource,
  AuthorResource,
} from '../domain/resource'
import * as Errors from '../errors'

import { nodeEnvironment } from '../env'

export const filterLocatorResources = (
  resource: Resource
): resource is LocatorResource => resource.resourceType !== 'config'

export const filterTagResources = (
  resource: Resource
): resource is TagResource => resource.resourceType === 'tag'

export const filterAuthorResources = (
  resource: Resource
): resource is AuthorResource => resource.resourceType === 'author'

export const isProductionBuild = nodeEnvironment === 'production'

export const pathToRegexp = fromThrowable(_pathToRegexp, (error) =>
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
  return fromThrowable(
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

export const safeJsonParse = fromThrowable(JSON.parse, (error: unknown) =>
  error instanceof Error ? Errors.parse(error) : Errors.other('JSON.parse')
)

export const safeJsonStringify = fromThrowable(
  JSON.stringify,
  (error: unknown) =>
    error instanceof Error
      ? Errors.parse(error)
      : Errors.other('JSON.stringify')
)

export const safeGraphqlParse = fromThrowable(graphql.parse, (error: unknown) =>
  error instanceof Error ? Errors.parse(error) : Errors.other('graphql.parse')
)

export const safeGraphqlStringify = fromThrowable(
  graphql.print,
  (error: unknown) =>
    error instanceof Error ? Errors.parse(error) : Errors.other('graphql.print')
)

export const normalize = fromThrowable(_normalize, (error) =>
  Errors.other(
    '`normalizr#normalize`',
    error instanceof Error ? error : undefined
  )
)

export const denormalize = fromThrowable(_denormalize, (error) =>
  Errors.other(
    '`normalizr#denormalize`',
    error instanceof Error ? error : undefined
  )
)
