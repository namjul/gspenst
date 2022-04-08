import { assertUnreachable } from './helpers'

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

export function formatError(error: GspenstError) {
  const { type } = error
  switch (type) {
    case 'Other':
      if (error.error) {
        return new Error(`${error.type}: ${error.error.message}`, {
          cause: error.error,
        })
      }
      return new Error(`${error.type}`)
    case 'Validation':
      return new Error(
        `${error.type}: ${error.message}${error.help ? `\n${error.help}` : ''}`
      )
    case 'NotFound':
      return new Error(`${error.type}: ${error.context}`)
    default:
      return assertUnreachable(type)
  }
}
