import path from 'path'
import type { Key } from 'path-to-regexp'
import { ok } from '../shared/kernel'
import type { ID } from '../shared/kernel'
import type { Request } from '../domain/routing'
import type { Collection } from '../domain/routes'
import type { LocatorResource } from '../domain/resource'
import ParentRouter from './ParentRouter'

class CollectionRouter extends ParentRouter {
  routerName: string
  config: Collection
  keysRoute: Key[] = []
  keysPermalink: Key[] = []
  postSet: Set<ID>
  constructor(mainRoute: string, config: Collection, postStack: Set<ID>) {
    super('CollectionRouter', config.data)
    this.route = mainRoute
    this.config = config
    this.postSet = postStack
    this.routerName = mainRoute === '/' ? 'index' : mainRoute.replace(/\//g, '')

    this.mountRoute(
      `${this.trimRoute(this.route)}{page/:page(\\d+)}?`,
      ({ match, matches }) => {
        const page = matches[0]
        return ok(
          this.#createEntriesContext(match, page ? Number(page) : undefined)
        )
      }
    )

    this.mountRoute(
      this.config.permalink,
      ({ match, matches, keys }, routers) => {
        if (matches.length) {
          const paramsResult = this.extractParams(matches, keys)

          if (paramsResult.isOk()) {
            const params = paramsResult.value
            const router = this.respectDominantRouter(
              routers,
              'post',
              params.slug
            )

            if (router) {
              return ok(this.createRedirectContext(router))
            } else {
              return ok(this.#createEntryContext(match, params))
            }
          }
        }
        return ok(undefined)
      }
    )
  }

  #createEntriesContext(_path: string, page?: number) {
    return {
      type: 'collection' as const,
      name: this.routerName,
      request: { path: _path, params: { page } },
      templates: [this.config.template ?? []].flat(),
      data: this.data?.query ?? {},
      filter: this.config.filter,
      limit: this.config.limit,
      order: this.config.order,
    }
  }

  #createEntryContext(_path: string, params: Request['params']) {
    return {
      type: 'entry' as const,
      resourceType: 'post' as const,
      request: { path: _path, params },
      templates: [this.config.template ?? []].flat(),
      data: {},
    }
  }

  resolvePaths(routers: ParentRouter[], resources: LocatorResource[]) {
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

    const paths = [this.getRoute()]
      .concat(
        postResources.flatMap((resource) => {
          if (
            this.respectDominantRouter(
              routers,
              resource.type,
              'slug' in resource ? resource.slug : undefined
            )
          ) {
            return []
          }

          if (!this.postSet.has(resource.id)) {
            this.postSet.add(resource.id)
            return resource.path
          }
          return []
        })
      )
      .concat(
        ...Array.from(
          {
            length: pages,
          },
          (_, i) => {
            return path.join(this.getRoute(), 'page', String(i + 1))
          }
        )
      )

    return paths
  }
}

export default CollectionRouter
