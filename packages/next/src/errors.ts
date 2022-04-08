export type GspenstError =
  | { type: 'Other'; error: Error | undefined; context?: string }
  | { type: 'NotFound'; context: string | undefined }

export const other = (context: string, error?: Error): GspenstError => ({
  type: 'Other',
  context,
  error,
})

export const notFound = (context?: string): GspenstError => ({
  type: 'NotFound',
  context,
})

// export const invalidRouting = ()

export function extractErrorType(error: GspenstError) {
  if (error.type === 'Other') {
    if (error.error) {
      return error.error
    }
  }

  const { type, context } = error
  return new Error(`${type}: ${context}`)
}
