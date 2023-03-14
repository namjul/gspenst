import { ok, type Result, type Option } from '../shared/kernel'
import { pathToRegexp } from '../utils'
import { type RoutingContext } from '../domain/routing'
import ParentRouter from './ParentRouter'

class AdminRouter extends ParentRouter {
  routeRegExpResult: Result<RegExp>
  constructor() {
    super('AdminRouter')
    this.routeRegExpResult = pathToRegexp('/admin')
  }
  handle(
    request: string,
    contexts: Result<Option<RoutingContext>>[],
    routers: ParentRouter[]
  ) {
    contexts.push(
      this.routeRegExpResult.andThen((routeRegExp) => {
        const [match] = routeRegExp.exec(request) ?? []

        if (match) {
          return ok({
            type: 'internal' as const,
          })
        }
        return ok(undefined)
      })
    )
    return super.handle(request, contexts, routers)
  }

  resolvePaths() {
    return ['/admin']
  }
}

export default AdminRouter
