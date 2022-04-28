import { ok } from '../shared-kernel'
import type { Result, Option } from '../shared-kernel'
import { pathToRegexp } from '../helpers'
import type { RoutingContext, Request } from '../domain/routing'
import { processQueryComplete } from '../helpers/processQuery'
import ParentRouter from './ParentRouter'

class StaticPagesRouter extends ParentRouter {
  routeRegExpResult: Result<RegExp>
  constructor() {
    super('StaticPagesRouter')
    this.routeRegExpResult = pathToRegexp('/:slug/')
  }
  handle(
    request: string,
    contexts: Result<Option<RoutingContext>>[],
    routers: ParentRouter[]
  ) {
    contexts.push(
      this.routeRegExpResult.andThen((routeRegExp) => {
        const [match, slug] = routeRegExp.exec(request) ?? []

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
      templates: [],
    }
  }

  async resolvePaths(routers: ParentRouter[]) {
    const taxonomyQuery = {
      type: 'browse',
      resourceType: 'page',
      limit: 'all',
    } as const
    return (await processQueryComplete(taxonomyQuery)).map((pages) => {
      return pages
        .filter(
          (pageResource) =>
            !this.respectDominantRouter(
              routers,
              pageResource.resourceType,
              pageResource.slug
            )
        )
        .map((pageResource) => {
          return `/${pageResource.slug}`
        })
    })
  }
}

export default StaticPagesRouter
