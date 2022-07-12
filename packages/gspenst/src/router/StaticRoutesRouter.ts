import path from 'path'
import type { Key } from 'path-to-regexp'
import { ok } from '../shared/kernel'
import type { Result, Option } from '../shared/kernel'
import { pathToRegexp } from '../utils'
import type { RoutingContext } from '../domain/routing'
import type { Route } from '../domain/routes'
import type { Resource } from '../domain/resource'
import ParentRouter from './ParentRouter'

class StaticRoutesRouter extends ParentRouter {
  routeRegExpResult: Result<RegExp>
  config: Route
  routerName: string
  keys: Key[] = []
  constructor(mainRoute: string, config: Route) {
    super('StaticRoutesRouter', config.data)
    this.route = mainRoute
    this.config = config
    this.routeRegExpResult = pathToRegexp(
      path.join(`/${this.route}`, '{page/:page(\\d+)}?'),
      this.keys
    )
    this.routerName = mainRoute === '/' ? 'index' : mainRoute.replace(/\//g, '')
  }
  handle(
    request: string,
    contexts: Result<Option<RoutingContext>>[],
    routers: ParentRouter[]
  ) {
    contexts.push(
      this.routeRegExpResult.andThen((regExp) => {
        const [match, page] = regExp.exec(request) ?? []

        if (match) {
          if (this.config.controller === 'channel') {
            return ok(
              this.#createChannelContext(match, page ? Number(page) : undefined)
            )
          }
          return ok(this.#createStaticRouteContext(match))
        }
        return ok(undefined)
      })
    )

    return super.handle(request, contexts, routers)
  }
  #createChannelContext(_path: string, page?: number) {
    return {
      type: 'channel' as const,
      name: this.routerName,
      templates: [this.config.template ?? []].flat(),
      request: { path: _path, params: { page } },
      data: this.data?.query ?? {},
      filter: this.config.filter,
      limit: this.config.limit,
      order: this.config.order,
    }
  }
  #createStaticRouteContext(_path: string) {
    return {
      type: 'custom' as const,
      templates: [this.config.template ?? []].flat(),
      request: { path: _path },
      data: this.data?.query ?? {},
    }
  }

  resolvePaths(_routers: ParentRouter[], resources: Resource[]) {
    const mainRoute = this.getRoute()
    if ('controller' in this.config && this.config.controller === 'channel') {
      const postResources = resources.filter(
        (resource) =>
          resource.type === 'post' &&
          (this.config.filter
            ? resource.filters.includes(this.config.filter)
            : true)
      )

      const pages = Math.ceil(
        postResources.length /
          (this.config.limit === 'all' ? 1 : this.config.limit)
      )

      return [
        mainRoute,
        ...Array.from(
          {
            length: pages,
          },
          (_, i) => path.join(mainRoute, 'page', String(i + 1))
        ),
      ]
    }
    return [mainRoute]
  }
}

export default StaticRoutesRouter