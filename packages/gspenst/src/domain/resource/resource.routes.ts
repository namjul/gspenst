import { z } from '../../shared/kernel'
import { parse } from '../../helpers/parser'
import { routesSchema, type RoutesConfigInput } from '../routes'
import { resourceBaseSchema } from './resource.base'
import defaultRoutes from '../../defaultRoutes'

export const resourceTypeRoutes = z.literal('routes')

export const routesResourceSchema = resourceBaseSchema.merge(
  z.object({
    type: resourceTypeRoutes,
    data: routesSchema,
  })
)

export type RoutesResource = z.infer<typeof routesResourceSchema>

export function createRoutesResource(data: RoutesConfigInput) {
  const routesResource = {
    type: 'routes',
    id: 'route',
    path: 'not-path',
    time: new Date().getTime(),
    data: {
      ...defaultRoutes,
      //@ts-expect-error --- data can be unknown.
      ...data,
    },
    metadata: {},
  }
  return parse(routesResourceSchema, routesResource)
}
