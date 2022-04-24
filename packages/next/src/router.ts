import path from 'path'
import { slugify } from '@tryghost/string'
import type { Key } from 'path-to-regexp'
import { pathToRegexp } from './helpers' // TODO use this instead
import { ok, combine } from './shared-kernel'
import type { RoutingContextType } from './types'
import type { Entries, Simplify, Result, Option } from './shared-kernel'
import type { ResourceType, DynamicVariables } from './domain/resource'
import type { Taxonomies } from './domain/taxonomy'
import type {
  RoutingConfigResolved,
  Collection,
  Route,
  Data,
  DataQuery,
  QueryFilterOptions,
} from './domain/routes'

export type Redirect =
  | {
      destination: string
      statusCode: 301 | 302 | 303 | 307 | 308
      basePath?: false
    }
  | {
      destination: string
      permanent: boolean
      basePath?: false
    }

type Request = {
  path: string
  params?:
    | Simplify<Partial<DynamicVariables & { page: number | undefined }>>
    | undefined
}

export type RoutingContext =
  | ({
      type: Extract<RoutingContextType, 'collection'>
      name: string
      data:
        | {
            [key: string]: DataQuery
          }
        | undefined
      templates: string[]
      request: Request
    } & QueryFilterOptions)
  | ({
      type: Extract<RoutingContextType, 'channel'>
      name: string
      data:
        | {
            [key: string]: DataQuery
          }
        | undefined
      templates: string[]
      request: Request
    } & QueryFilterOptions)
  | {
      type: Extract<RoutingContextType, 'entry'>
      resourceType: ResourceType
      templates: string[]
      request: Request
    }
  | {
      type: Extract<RoutingContextType, 'custom'>
      data:
        | {
            [key: string]: DataQuery
          }
        | undefined
      templates: string[]
      request: Request
    }
  | ({ type: Extract<RoutingContextType, 'redirect'> } & Redirect)
  | { type: Extract<RoutingContextType, 'internal'> }

class ParentRouter {
  name: string
  nextRouter?: ParentRouter
  route?: string
  data?: Data | undefined
  constructor(name: string, data?: Data) {
    this.name = name
    this.data = data
  }

  mount(router: ParentRouter) {
    this.nextRouter = router
    return router
  }

  handle(
    request: string,
    contexts: Result<Option<RoutingContext>>[],
    routers: ParentRouter[]
  ): Result<Option<RoutingContext>>[] {
    if (this.nextRouter) {
      return this.nextRouter.handle(request, contexts, routers)
    }

    return contexts
  }

  respectDominantRouter(
    routers: ParentRouter[],
    resourceType: ResourceType,
    slug: string | undefined
  ): ParentRouter | undefined {
    return routers.find((router) =>
      router.isRedirectEnabled(resourceType, slug)
    )
  }

  createRedirectContext(router: ParentRouter | string) {
    return {
      type: 'redirect' as const,
      destination: typeof router === 'string' ? router : router.getRoute(),
      statusCode: 301 as const,
    }
  }

  isRedirectEnabled(
    resourceType: ResourceType,
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
    return values.reduce<Partial<DynamicVariables & { page: number }>>(
      // return values.reduce<Record<string, string>>(
      (acc, current, index) => {
        const key = keys[index]
        if (key && current) {
          return {
            [key.name]: ['page', 'year', 'month', 'day'].includes(
              key.name as string
            )
              ? Number(current)
              : current,
            ...acc,
          }
        }
        return acc
      },
      {}
    )
  }

  getRoute() {
    // return urlUtils.createUrl(this.route)
    return this.route ?? '/'
  }
}

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
}

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
      data: this.data?.query,
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
      data: this.data?.query,
    }
  }
}

class TaxonomyRouter extends ParentRouter {
  taxonomyKey: Taxonomies
  permalink: string
  permalinkRegExpResult: Result<RegExp>
  keys: Key[] = []
  constructor(key: Taxonomies, permalink: string) {
    super('TaxonomyRouter')
    this.taxonomyKey = key
    this.permalink = permalink
    this.permalinkRegExpResult = pathToRegexp(
      path.join(`/${this.permalink}`, '{page/:page(\\d+)}?'),
      this.keys
    )
  }
  handle(
    request: string,
    contexts: Result<Option<RoutingContext>>[],
    routers: ParentRouter[]
  ) {
    contexts.push(
      this.permalinkRegExpResult.andThen((regExp) => {
        const [match, ...paramKeys] = regExp.exec(request) ?? []

        if (match && paramKeys.length) {
          const params = this.extractParams(paramKeys, this.keys)

          const router = this.respectDominantRouter(
            routers,
            this.taxonomyKey,
            params.slug
          )
          if (router) {
            return ok(this.createRedirectContext(router))
          } else {
            return ok(this.#createContext(match, params))
          }
        }
        return ok(undefined)
      })
    )

    return super.handle(request, contexts, routers)
  }

  #createContext(_path: string, params?: Request['params']) {
    return {
      type: 'channel' as const,
      name: this.taxonomyKey,
      request: {
        path: _path,
        params,
      },
      templates: [],
      data: this.data?.query,
      filter: `tags:'${params?.slug ?? '%s'}'`,
      limit: undefined,
      order: undefined,
    }
  }
}

class CollectionRouter extends ParentRouter {
  routerName: string
  permalink: string
  routeRegExpResult: Result<RegExp>
  permalinkRegExpResult: Result<RegExp>
  config: Collection
  keysRoute: Key[] = []
  keysPermalink: Key[] = []
  constructor(mainRoute: string, config: Collection) {
    super('CollectionRouter', config.data)
    this.route = mainRoute
    this.config = config
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
}

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
}

export const routerManager = (routingConfig: RoutingConfigResolved) => {
  const config: RoutingConfigResolved = routingConfig
  const router: ParentRouter = new ParentRouter('SiteRouter')
  const routers: ParentRouter[] = []

  routers.push(router)

  /**
   * 1. Admin: Strongest inbuilt features, which you can never override.
   * 2. Static Routes: Very strong, because you can override any urls and redirect to a static route.
   * 3. Taxonomies: Stronger than collections, because it's an inbuilt feature.
   * 4. Collections
   * 5. Static Pages: Weaker than collections, because we first try to find a post slug and fallback to lookup a static page.
   */

  // 1.
  const adminRouter = new AdminRouter()
  routers.push(adminRouter)

  // 2.
  const routes = Object.entries(config.routes ?? {}) as Entries<
    typeof config.routes
  >
  routes.forEach(([key, value]) => {
    const staticRoutesRouter = new StaticRoutesRouter(key, value)
    routers.push(staticRoutesRouter)
  })

  // 3.
  const collections = Object.entries(config.collections ?? {}) as Entries<
    typeof config.collections
  >
  collections.forEach(([key, value]) => {
    const collectionRouter = new CollectionRouter(key, value)
    routers.push(collectionRouter)
  })

  // 4.
  const taxonomies = Object.entries(config.taxonomies ?? {}) as Entries<
    typeof config.taxonomies
  >
  taxonomies.forEach(([key, permalink]) => {
    const taxonomyRouter = new TaxonomyRouter(key, permalink as string)
    routers.push(taxonomyRouter)
  })

  // 5.
  const staticPagesRouter = new StaticPagesRouter()
  routers.push(staticPagesRouter)

  // mount routers into a chain of responsibilities
  routers.reduce((acc, _router) => acc.mount(_router))

  return {
    handle(
      params: string[] | string = []
    ): Result<Option<RoutingContext>> | Result<Option<RoutingContext>[]> {
      if (params) {
        const request = `/${[params].flat().join('/')}/`
        const requestSlugified = `/${[params].flat().map(slugify).join('/')}/`
        if (request !== requestSlugified) {
          return ok(router.createRedirectContext(requestSlugified))
        }
        return combine(router.handle(request, [], routers))
      }
      return ok(undefined)
    },
  }
}
