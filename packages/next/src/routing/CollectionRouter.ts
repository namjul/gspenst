import path from 'path'
import type { Key } from 'path-to-regexp'
import { compilePermalink, pathToRegexp } from '../helpers'
import { ok, combine } from '../shared-kernel'
import type { Result, Option, ID } from '../shared-kernel'
import type { RoutingContext, Request } from '../domain/routing'
import type { Collection } from '../domain/routes'
import { processQueryComplete } from '../helpers/processQuery'
import ParentRouter from './ParentRouter'

class CollectionRouter extends ParentRouter {
  routerName: string
  permalink: string
  routeRegExpResult: Result<RegExp>
  permalinkRegExpResult: Result<RegExp>
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
    this.permalink = this.config.permalink
    this.routeRegExpResult = pathToRegexp(
      path.join(`/${this.route}`, '{page/:page(\\d+)}?'),
      this.keysRoute
    )
    this.permalinkRegExpResult = pathToRegexp(
      this.permalink,
      this.keysPermalink
    )
  }
  handle(
    request: string,
    contexts: Result<Option<RoutingContext>>[],
    routers: ParentRouter[]
  ) {
    contexts.push(
      combine([this.routeRegExpResult, this.permalinkRegExpResult]).andThen(
        ([routesRegExp, permalinkRegExp]) => {
          if (routesRegExp) {
            const [routeMatch, page] = routesRegExp.exec(request) ?? []

            if (routeMatch) {
              return ok(
                this.#createEntriesContext(
                  routeMatch,
                  page ? Number(page) : undefined
                )
              )
            }
          }

          if (permalinkRegExp) {
            const [permalinkMatch, ...paramKeys] =
              permalinkRegExp.exec(request) ?? []

            if (permalinkMatch && paramKeys.length) {
              const params = this.extractParams(paramKeys, this.keysPermalink)

              const router = this.respectDominantRouter(
                routers,
                'post',
                params.slug
              )

              if (router) {
                return ok(this.createRedirectContext(router))
              } else {
                return ok(this.#createEntryContext(permalinkMatch, params))
              }
            }
          }

          return ok(undefined)
        }
      )
    )

    return super.handle(request, contexts, routers)
  }

  #createEntriesContext(_path: string, page?: number) {
    return {
      type: 'collection' as const,
      name: this.routerName,
      request: { path: _path, params: { page } },
      templates: [this.config.template ?? []].flat(),
      data: this.data?.query,
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
    }
  }

  async resolvePaths(routers: ParentRouter[]) {
    const collectionPostsQuery = {
      type: 'browse',
      resourceType: 'post',
      filter: this.config.filter,
      limit: this.config.limit,
      order: this.config.order,
    } as const

    return (await processQueryComplete(collectionPostsQuery)).andThen(
      (resources) => {
        const paths: Result<string>[] = [ok(this.getRoute())]

        resources
          .filter(
            (resource) =>
              !this.respectDominantRouter(
                routers,
                resource.resourceType,
                resource.slug
              )
          )
          .forEach((resource) => {
            if (!this.postSet.has(resource.id)) {
              this.postSet.add(resource.id)
              paths.push(compilePermalink(this.config.permalink, resource))
            }
          })

        Array.from(
          {
            length:
              resources.length /
              (this.config.limit === 'all' ? 1 : this.config.limit),
          },
          (_, i) => {
            return paths.push(
              ok(path.join(this.getRoute(), 'page', String(i + 1)))
            )
          }
        )

        return combine(paths)
      }
    )
  }
}

export default CollectionRouter
