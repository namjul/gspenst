import { z } from '../shared/kernel'

import {
  resourceTypeAuthor,
  resourceTypeTag,
} from './resource/resource.locator'

export const taxonomies = z.union([resourceTypeAuthor, resourceTypeTag])
export type Taxonomies = z.infer<typeof taxonomies>
