import stringHash from 'fnv1a'
import type { ID } from './shared/kernel'

export const configId = stringHash('content/config/index.json') as ID
