import { ok } from '../shared-kernel'
import type { Result, Option } from '../shared-kernel'
import { pathToRegexp } from '../helpers'
import type { RoutingContext } from '../domain/routing'
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

  async resolvePaths(): Promise<Result<string[]>> {
    return ok(['/admin'])
  }
}

export default AdminRouter
