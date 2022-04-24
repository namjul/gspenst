import { absurd } from './utils'

export type GspenstError =
  | { type: 'Other'; error: Error | undefined; context?: string }
  | { type: 'Validation'; message: string; help?: string | undefined }
  | { type: 'NotFound'; context: string | undefined }

export const other = (context: string, error?: Error): GspenstError => ({
  type: 'Other',
  context,
  error,
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
          error.error ? `: cause: ${error.error.message} ${ error.error.stack }` : ''
        }`
      case 'Validation':
        return `${error.type}: ${error.message}${
          error.help ? `\n${error.help}` : ''
        }`
      case 'NotFound':
        return `${error.type}: ${error.context}`
      default:
        return absurd(type)
    }
  }

  const message = [errors]
    .flat()
    .reduce((acc, current) => [acc, formatError(current)].join('\n'), '')

  return new Error(message)
}
