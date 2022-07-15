import stringHash from 'fnv1a'
import type { ID } from './shared/kernel'

// TODO make configurable
export const configRelativePath = 'index.json'
export const configStringId = `content/config/${configRelativePath}`
export const configId = stringHash(configStringId) as ID
