import { slugify } from '@tryghost/string'
import { ok, combine } from '../shared/kernel'
import type { Result, Option, ID } from '../shared/kernel'
import type { RoutesConfig } from '../domain/routes'
import type { RoutingContext } from '../domain/routing'
import type { LocatorResource } from '../domain/resource'
import { getRoutes, getCollections, getTaxonomies } from '../domain/routes'

import AdminRouter from './AdminRouter'
import StaticPagesRouter from './StaticPagesRouter'
import CollectionRouter from './CollectionRouter'
import TaxonomyRouter from './TaxonomyRouter'
import StaticRoutesRouter from './StaticRoutesRouter'
import ParentRouter from './ParentRouter'

export const routerManager = (routesConfig: RoutesConfig) => {
  const config: RoutesConfig = routesConfig
  const router: ParentRouter = new ParentRouter('SiteRouter')
  const routers: ParentRouter[] = []

  routers.push(router)

  /**
   * 1. Admin: Strongest inbuilt features, which you can never override.
   * 2. Static Routes: Very strong, because you can override any urls and redirect to a static route.
   * 3. Taxonomies: Stronger than collections, because it's an inbuilt feature.
   * 4. Collections
   * 5. Static Pages: Weaker than collections, because we first try to find a post slug and fallback to lookup a static page.
   */

  // 1.
  const adminRouter = new AdminRouter()
  routers.push(adminRouter)

  // 2.
  getRoutes(config).forEach(([key, value]) => {
    const staticRoutesRouter = new StaticRoutesRouter(key, value)
    routers.push(staticRoutesRouter)
  })

  // 3.

  const postSet = new Set<ID>()
  getCollections(config).forEach(([key, value]) => {
    const collectionRouter = new CollectionRouter(key, value, postSet)
    routers.push(collectionRouter)
  })

  // 4.
  getTaxonomies(config).forEach(([key, value]) => {
    const taxonomyRouter = new TaxonomyRouter(key, value)
    routers.push(taxonomyRouter)
  })

  // 5.
  const staticPagesRouter = new StaticPagesRouter()
  routers.push(staticPagesRouter)

  // mount routers into a chain of responsibilities
  routers.reduce((acc, _router) => acc.mount(_router))

  return {
    handle(
      params: string[] | string = []
    ): Result<Option<RoutingContext>> | Result<Option<RoutingContext>[]> {
      if (params) {
        const request = `/${[params].flat().join('/')}/`
        const requestSlugified = `/${[params].flat().map(slugify).join('/')}/`
        if (request !== requestSlugified) {
          return ok(router.createRedirectContext(requestSlugified))
        }
        return combine(router.handle(request, [], routers))
      }
      return ok(undefined)
    },
    resolvePaths(resources: LocatorResource[]) {
      const paths = routers.flatMap((_router) => {
        return _router.resolvePaths(routers, resources)
      })
      return paths
    },
  }
}
