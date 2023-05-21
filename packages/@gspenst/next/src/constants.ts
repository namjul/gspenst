import { GspenstConfig } from './types'

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const PARAM_REGEX = /\[\[?\.*(\w*)\]\]?/

export const YAML_EXTENSION_REGEX = /\[\[\.\.\.\w+\]\]\.(yml|yaml)$/

export const DEFAULT_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx']

export const YAML_EXTENSIONS = ['yml', 'yaml']

export const DEFAULT_CONFIG: Omit<GspenstConfig, 'theme'> = {}
