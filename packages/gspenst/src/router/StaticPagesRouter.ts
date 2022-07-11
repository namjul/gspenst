import { ok } from '../shared/kernel'
import type { Result, Option } from '../shared/kernel'
import { pathToRegexp } from '../utils'
import type { RoutingContext, Request } from '../domain/routing'
import type { Resource } from '../domain/resource'
import ParentRouter from './ParentRouter'

class StaticPagesRouter extends ParentRouter {
  routeRegExpResult: Result<RegExp>
  constructor() {
    super('StaticPagesRouter')
    this.routeRegExpResult = pathToRegexp('/:slug+')
  }
  handle(
    request: string,
    contexts: Result<Option<RoutingContext>>[],
    routers: ParentRouter[]
  ) {
    contexts.push(
      this.routeRegExpResult.andThen((routeRegExp) => {
        const [match, path] = routeRegExp.exec(request) ?? []
        const slug = path?.split('/').at(-1)

        if (match && slug) {
          const router = this.respectDominantRouter(routers, 'page', slug)

          if (router) {
            return ok(this.createRedirectContext(router))
          } else {
            return ok(this.#createContext(match, { slug }))
          }
        }
        return ok(undefined)
      })
    )

    return super.handle(request, contexts, routers)
  }

  #createContext(_path: string, params?: Request['params']) {
    return {
      type: 'entry' as const,
      resourceType: 'page' as const,
      request: {
        path: _path,
        params,
      },
      data: {},
      templates: [],
    }
  }

  resolvePaths(routers: ParentRouter[], resources: Resource[]) {
    return resources.flatMap((resource) => {
      if (resource.type !== 'page') {
        return []
      }
      if (this.respectDominantRouter(routers, resource.type, resource.slug)) {
        return []
      }
      return resource.path
    })
  }
}

export default StaticPagesRouter
