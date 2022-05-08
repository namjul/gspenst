import type { Key } from 'path-to-regexp'
import type { Result, Option } from '../shared-kernel'
import type { RoutingContext } from '../domain/routing'
import type { Data } from '../domain/routes'
import type {
  ResourceType,
  DynamicVariables,
  Resource,
} from '../domain/resource'

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
    resourceType: ResourceType,
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
    resourceType: ResourceType,
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
    return values.reduce<Partial<DynamicVariables & { page: number }>>(
      // return values.reduce<Record<string, string>>(
      (acc, current, index) => {
        const key = keys[index]
        if (key && current) {
          return {
            [key.name]: ['page', 'year', 'month', 'day'].includes(
              key.name as string
            )
              ? Number(current)
              : current,
            ...acc,
          }
        }
        return acc
      },
      {}
    )
  }

  getRoute() {
    // return urlUtils.createUrl(this.route)
    return this.route ?? '/'
  }

  resolvePaths(
    _routers: ParentRouter[],
    _resources: Resource[]
  ): string[] {
    return []
  }
}

export default ParentRouter
