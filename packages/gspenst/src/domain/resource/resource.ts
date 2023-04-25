import { z } from '../../shared/kernel'
import {
  resourceTypeConfig,
  configResourceSchema,
} from './resource.config'
import {
  resourceTypePost,
  resourceTypePage,
  resourceTypeAuthor,
  resourceTypeTag,
  postResourceSchema,
  pageResourceSchema,
  authorResourceSchema,
  tagResourceSchema,
} from './resource.locator'
import { routesResourceSchema } from './resource.routes'

export const resourceTypeRoutes = z.literal('routes')

export const resourceTypes = [
  resourceTypeRoutes.value,
  resourceTypeConfig.value,
  resourceTypePost.value,
  resourceTypePage.value,
  resourceTypeAuthor.value,
  resourceTypeTag.value,
]

export const resourceTypeSchema = z.union([
  resourceTypeRoutes,
  resourceTypeConfig,
  resourceTypePost,
  resourceTypePage,
  resourceTypeAuthor,
  resourceTypeTag,
])

export const tinaResourceSchema = z
  .discriminatedUnion('type', [
    configResourceSchema,
    postResourceSchema,
    pageResourceSchema,
    authorResourceSchema,
    tagResourceSchema,
  ])
  .describe('tinaResourceSchema')


export const tinaResourceTypeSchema = z.union([
  resourceTypeConfig,
  resourceTypePost,
  resourceTypePage,
  resourceTypeAuthor,
  resourceTypeTag,
])

export type TinaResourceType = z.infer<typeof tinaResourceTypeSchema>
export type TinaResource = z.infer<typeof tinaResourceSchema>

export const resourceSchema = z
  .discriminatedUnion('type', [
    routesResourceSchema,
    configResourceSchema,
    postResourceSchema,
    pageResourceSchema,
    authorResourceSchema,
    tagResourceSchema,
  ])
  .describe('resourceSchema')

export type ResourceType = z.infer<typeof resourceTypeSchema>
export type Resource = z.infer<typeof resourceSchema>
