import path from 'path'
import { type Key } from 'path-to-regexp'
import { ok } from '../shared/kernel'
import { type Route } from '../domain/routes'
import { type Resource } from '../domain/resource'
import ParentRouter, { type RouteCb } from './ParentRouter'

class StaticRoutesRouter extends ParentRouter {
  config: Route
  routerName: string
  keys: Key[] = []
  constructor(mainRoute: string, config: Route) {
    super('StaticRoutesRouter', config.data)
    this.route = mainRoute
    this.config = config

    this.routerName = mainRoute === '/' ? 'index' : mainRoute.replace(/\//g, '')

    this.mountRoute(this.route, this.#handleRoute)
    this.mountRoute(
      `${this.trimRoute(this.route)}/page/:page(\\d+)`,
      this.#handleRoute
    )
  }

  #handleRoute: RouteCb = ({ match, matches, keys }) => {
    const paramsResult = this.extractParams(matches, keys)
    if (paramsResult.isOk()) {
      const params = paramsResult.value
      if (this.config.controller === 'channel') {
        return ok(this.#createChannelContext(match, params.page))
      }
      return ok(this.#createStaticRouteContext(match))
    }
    return ok(undefined)
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
            ? resource.metadata.filters.includes(this.config.filter)
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
