import type { Key } from 'path-to-regexp'
import type { Result, Option } from '../shared/kernel'
import type { RoutingContext } from '../domain/routing'
import type { Data } from '../domain/routes'
import type { LocatorResourceType, LocatorResource } from '../domain/resource'
import { paramsSchema } from '../domain/routing'
import { parse } from '../helpers/parser'

class ParentRouter {
  name: string
  nextRouter?: ParentRouter
  route?: string
  data?: Data | undefined
  constructor(name: string, data?: Data) {
    this.name = name
    this.data = data
  }

  mount(router: ParentRouter) {
    this.nextRouter = router
    return router
  }

  handle(
    request: string,
    contexts: Result<Option<RoutingContext>>[],
    routers: ParentRouter[]
  ): Result<Option<RoutingContext>>[] {
    if (this.nextRouter) {
      return this.nextRouter.handle(request, contexts, routers)
    }

    return contexts
  }

  respectDominantRouter(
    routers: ParentRouter[],
    resourceType: LocatorResourceType,
    slug: string | undefined
  ): ParentRouter | undefined {
    return routers.find((router) =>
      router.isRedirectEnabled(resourceType, slug)
    )
  }

  createRedirectContext(router: ParentRouter | string) {
    return {
      type: 'redirect' as const,
      redirect: {
        destination: typeof router === 'string' ? router : router.getRoute(),
        permanent: true,
      },
    }
  }

  isRedirectEnabled(
    resourceType: LocatorResourceType,
    slug: string | undefined
  ): boolean {
    if (!this.data || Object.keys(this.data.router).length === 0) {
      return false
    }

    return Object.entries(this.data.router).some(([type, entries]) => {
      if (resourceType === type) {
        return entries.find((entry) => {
          return entry.redirect && entry.slug === slug
        })
      }
      return false
    })
  }

  // TODO force equal array length https://stackoverflow.com/questions/65361696/arguments-of-same-length-typescript
  extractParams(values: string[], keys: Key[]) {
    const input = values.reduce((acc, current, index) => {
      const key = keys[index]
      if (key && current) {
        return {
          [key.name]: current,
          ...acc,
        }
      }
      return acc
    }, {})

    return parse(paramsSchema.partial(), input)
  }

  getRoute() {
    // return urlUtils.createUrl(this.route)
    return this.route ?? '/'
  }

  resolvePaths(
    _routers: ParentRouter[],
    _resources: LocatorResource[]
  ): string[] {
    return []
  }
}

export default ParentRouter
