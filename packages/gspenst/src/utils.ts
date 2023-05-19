import spawn from 'cross-spawn'
import { Repository } from '@napi-rs/simple-git'
import * as graphql from 'graphql'
import { compile, pathToRegexp as _pathToRegexp } from 'path-to-regexp' // TODO use https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#pattern_syntax
import { type GspenstResult, fromThrowable } from './shared/kernel'
import { type DynamicVariables } from './domain/resource/resource.locator'
import * as Errors from './errors'

export const gitDiscover = fromThrowable(Repository.discover, (error) =>
  Errors.other(
    '`@napi-rs/simple-git`',
    error instanceof Error ? error : undefined
  )
)

export const pathToRegexp = fromThrowable(_pathToRegexp, (error) =>
  Errors.other('`path-to-regexp`', error instanceof Error ? error : undefined)
)

export function compilePermalink(
  permalink: string,
  dynamicVariables: DynamicVariables
): GspenstResult<string> {
  return fromThrowable(compile(permalink), (error: unknown) =>
    error instanceof Error
      ? Errors.parse(error, '`path-to-regexp`#compile')
      : Errors.other(
          '`path-to-regexp`#compile',
          error instanceof Error ? error : undefined
        )
  )(dynamicVariables)
}

export const safeJsonParse = fromThrowable(JSON.parse, (error: unknown) =>
  error instanceof Error
    ? Errors.parse(error, 'JSON.parse')
    : Errors.other('JSON.parse')
)

export const safeJsonStringify = fromThrowable(
  JSON.stringify,
  (error: unknown) =>
    error instanceof Error
      ? Errors.parse(error, 'JSON.stringify')
      : Errors.other('JSON.stringify')
)

export const safeGraphqlParse = fromThrowable(graphql.parse, (error: unknown) =>
  error instanceof Error
    ? Errors.parse(error, 'graphql.parse')
    : Errors.other('graphql.parse')
)

export const safeGraphqlStringify = fromThrowable(
  graphql.print,
  (error: unknown) =>
    error instanceof Error
      ? Errors.parse(error, 'graphql.print')
      : Errors.other('graphql.print')
)

export const startSubprocess = async ({
  command,
  cwd,
}: {
  command: string
  cwd?: string
}) => {
  if (typeof command === 'string') {
    const commands = command.split(' ')
    const firstCommand = commands[0]
    const args = commands.slice(1)
    const ps = spawn(firstCommand!, args, {
      stdio: 'inherit',
      shell: true,
      cwd,
    })
    ps.on('error', (code) => {
      console.error(`name: ${code.name}
message: ${code.message}

stack: ${code.stack ?? 'No stack was provided'}`)
    })
    ps.on('close', (code) => {
      console.info(`child process exited with code ${code}`)
      // process.exit(code ?? undefined)
    })
    return ps
  }
}
