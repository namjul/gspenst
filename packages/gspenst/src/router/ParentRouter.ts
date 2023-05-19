import { type Key } from 'path-to-regexp'
import { ok, Result, type GspenstResult, type Option } from '../shared/kernel'
import { paramsSchema, type RoutingContext } from '../domain/routing'
import { type Data } from '../domain/routes'
import {
  type LocatorResourceType,
  type LocatorResource,
} from '../domain/resource/resource.locator'
import { pathToRegexp } from '../utils'
import { parse } from '../helpers/parser'

export type RouteCb = (
  match: { match: string; matches: string[]; keys: Key[] },
  routers: ParentRouter[]
) => GspenstResult<Option<RoutingContext>>

export type Route = {
  regExp: RegExp
  path: string
  keys: Key[]
  callback: RouteCb
}

class ParentRouter {
  name: string
  route?: string
  data?: Data | undefined
  #nextRouter?: ParentRouter
  #routes: GspenstResult<Route>[] = []

  constructor(name: string, data?: Data) {
    this.name = name
    this.data = data
  }

  mountRouter(router: ParentRouter) {
    this.#nextRouter = router
    return router
  }

  mountRoute(path: string, callback: Route['callback']) {
    const keys: Key[] = []
    this.#routes.push(
      pathToRegexp(this.trimRoute(path), keys).map((regExp) => ({
        path,
        regExp,
        keys,
        callback,
      }))
    )
  }

  handleRequest(
    _regExpexecArray: RegExpExecArray
  ): GspenstResult<Option<RoutingContext>> {
    return ok(undefined)
  }

  handle(
    request: string,
    contexts: GspenstResult<Option<RoutingContext>>[],
    routers: ParentRouter[]
  ): GspenstResult<Option<RoutingContext>>[] {
    contexts.push(
      Result.combine(this.#routes).andThen((routes) => {
        const routingContextResults = routes.flatMap((route) => {
          const [match, ...matches] = route.regExp.exec(request) ?? []
          if (match) {
            return [
              route.callback({ match, matches, keys: route.keys }, routers),
            ]
          }
          return []
        })

        const first = routingContextResults.at(0)
        if (first) {
          return first
        }
        return ok(undefined)
      })
    )

    if (this.#nextRouter) {
      return this.#nextRouter.handle(request, contexts, routers)
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
    return this.route ?? '/'
  }

  resolvePaths(
    _routers: ParentRouter[],
    _resources: LocatorResource[]
  ): string[] {
    return []
  }

  trimRoute(route: string) {
    return `/${route.split('/').filter(Boolean).join('/')}`
  }
}

export default ParentRouter
