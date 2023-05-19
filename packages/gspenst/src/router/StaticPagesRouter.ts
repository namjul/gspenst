import { type GspenstResult, ok } from '../shared/kernel'
import { pathToRegexp } from '../utils'
import { type Request } from '../domain/routing'
import { type Resource } from '../domain/resource'
import ParentRouter from './ParentRouter'

class StaticPagesRouter extends ParentRouter {
  routeRegExpResult: GspenstResult<RegExp>
  constructor() {
    super('StaticPagesRouter')
    this.routeRegExpResult = pathToRegexp('/:slug+')

    this.mountRoute('/:slug+', ({ match, matches }, routers) => {
      const path = matches[0]
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
      if (
        this.respectDominantRouter(
          routers,
          resource.type,
          resource.metadata.slug
        )
      ) {
        return []
      }
      return resource.metadata.path
    })
  }
}

export default StaticPagesRouter
