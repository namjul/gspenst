import { z } from '../shared-kernel'

import { resourceType as resourceTypeTag } from './tag'
import { resourceType as resourceTypeAuthor } from './author'

export const taxonomies = z.union([resourceTypeAuthor, resourceTypeTag])
export type Taxonomies = z.infer<typeof taxonomies>
