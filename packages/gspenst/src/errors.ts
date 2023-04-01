import { z, type Entries } from './shared/kernel'
import { do_, assertUnreachable as absurd_ } from './shared/utils'

export type GspenstError =
  | { type: 'Other'; error: Error | undefined; context?: string }
  | { type: 'Validation'; message: string; help?: string | undefined }
  | { type: 'NotFound'; context: string | undefined }
  | { type: 'Parse'; error: Error; description: string | undefined }
  | { type: 'Absurd'; message: string | undefined }

export const other = (context: string, error?: Error): GspenstError => ({
  type: 'Other',
  context,
  error,
})

export const absurd = (message: string): GspenstError => ({
  type: 'Absurd',
  message,
})

export const parse = <T extends Error>(
  error: T,
  description: string | undefined
): GspenstError => ({
  type: 'Parse',
  error,
  description,
})

export const validation = ({
  message,
  help,
}: {
  message: string
  help?: string
}): GspenstError => ({
  type: 'Validation',
  message,
  help,
})

export const notFound = (context?: string): GspenstError => ({
  type: 'NotFound',
  context,
})

// export const invalidRouting = ()

export function format(errors: GspenstError | GspenstError[]) {
  const formatError = (error: GspenstError) => {
    const { type } = error
    switch (type) {
      case 'Other':
        return `${error.type}: ${error.context} ${
          error.error
            ? `: cause: ${error.error.message} ${error.error.stack}`
            : ''
        }`
      case 'Validation':
        return `${error.type}: ${error.message}${
          error.help ? `\n${error.help}` : ''
        }`
      case 'NotFound':
        return `${error.type}: ${error.context}`
      case 'Parse': {
        const cause = do_(() => {
          if (error.error instanceof z.ZodError) {
            const formatedErrors = error.error.format()
            return (Object.entries(formatedErrors) as Entries<typeof formatedErrors>).flatMap(
              ([name, value]) => {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition --- TODO fix
                return `${name}: ${value.join?.(', ')}\n`
              }
            )
          }

          return error.error.message
        })

        return `❌ ${error.type}:
cause: ${cause}
errorStack: ${error.error.stack}
description: ${error.description ?? 'NA'}
`
      }
      case 'Absurd':
        return `${error.type}: ${error.message}`
      default:
        return absurd_(type)
    }
  }

  const message = [errors]
    .flat()
    .reduce((acc, current) => [acc, formatError(current)].join('\n'), '')

  return new Error(message)
}
