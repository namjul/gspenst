import type { ID } from './shared-kernel'
import { stringHash } from './shared-kernel'

export const configId = stringHash('content/config/index.json') as ID
