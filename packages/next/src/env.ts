import { isString } from './shared/utils'

type ProcessEnv = typeof process.env

const env = process.env

const verifyEnv = (envName: keyof ProcessEnv): string => {
  const value = env[envName]

  if (!isString(value)) {
    throw new Error(`Invalid '${envName}' variable: ${value}`)
  }

  return value
}

const { GSPENST_STATIC_EXPORT } = env

export const staticExport = !!GSPENST_STATIC_EXPORT
export const nodeEnvironment = verifyEnv('NODE_ENV')
