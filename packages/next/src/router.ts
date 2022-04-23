import path from 'path'
import { slugify } from '@tryghost/string'
import { pathToRegexp } from 'path-to-regexp'
// import { permalinkToRegexp } from './helpers'; // TODO use this instead
import type { Key } from 'path-to-regexp'
import type { RoutingContextType } from './types'
import type { Entries, Simplify } from './shared-kernel'
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
    contexts: RoutingContext[],
    routers: ParentRouter[]
  ): RoutingContext[] {
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
  routeRegExp: RegExp
  constructor() {
    super('AdminRouter')
    this.routeRegExp = pathToRegexp('/admin')
  }
  handle(request: string, context: RoutingContext[], routers: ParentRouter[]) {
    const [match] = this.routeRegExp.exec(request) ?? []

    if (match) {
      context.push({
        type: 'internal' as const,
      })
    }
    return super.handle(request, context, routers)
  }
}

class StaticRoutesRouter extends ParentRouter {
  routeRegExp: RegExp
  config: Route
  constructor(mainRoute: string, config: Route) {
    super('StaticRoutesRouter', config.data)
    this.route = mainRoute
    this.config = config
    this.routeRegExp = pathToRegexp(this.route)
  }
  handle(request: string, contexts: RoutingContext[], routers: ParentRouter[]) {
    const [match] = this.routeRegExp.exec(request) ?? []

    if (match) {
      contexts.push(this.#createContext(match))
    }
    return super.handle(request, contexts, routers)
  }
  #createContext(_path: string) {
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
  permalinkRegExp: RegExp
  keys: Key[] = []
  constructor(key: Taxonomies, permalink: string) {
    super('TaxonomyRouter')
    this.taxonomyKey = key
    this.permalink = permalink
    this.permalinkRegExp = pathToRegexp(
      path.join(`/${this.permalink}`, '{page/:page(\\d+)}?'),
      this.keys
    )
  }
  handle(request: string, contexts: RoutingContext[], routers: ParentRouter[]) {
    const [permalinkMatch, ...paramKeys] =
      this.permalinkRegExp.exec(request) ?? []

    if (permalinkMatch && paramKeys.length) {
      const params = this.extractParams(paramKeys, this.keys)

      const router = this.respectDominantRouter(
        routers,
        this.taxonomyKey,
        params.slug
      )
      if (router) {
        contexts.push(this.createRedirectContext(router))
      } else {
        contexts.push(this.#createContext(permalinkMatch, params))
      }
    }
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
  routeRegExp: RegExp
  permalinkRegExp: RegExp
  pagesRegExp: RegExp
  config: Collection
  keys: Key[] = []
  constructor(mainRoute: string, config: Collection) {
    super('CollectionRouter', config.data)
    this.route = mainRoute
    this.config = config
    this.routerName = mainRoute === '/' ? 'index' : mainRoute.replace(/\//g, '')
    this.routeRegExp = pathToRegexp(this.route)
    this.permalink = this.config.permalink
    this.permalinkRegExp = pathToRegexp(this.permalink, this.keys)
    this.pagesRegExp = pathToRegexp(
      path.join(this.route, 'page', ':page(\\d+)')
    )
  }
  handle(request: string, contexts: RoutingContext[], routers: ParentRouter[]) {
    const [routeMatch] = this.routeRegExp.exec(request) ?? []

    if (routeMatch) {
      contexts.push(this.#createEntriesContext(routeMatch))
    }

    const [pageMatch, page] = this.pagesRegExp.exec(request) ?? []

    if (pageMatch && page) {
      contexts.push(this.#createEntriesContext(pageMatch, Number(page)))
    }

    const [permalinkMatch, ...paramKeys] =
      this.permalinkRegExp.exec(request) ?? []

    if (permalinkMatch && paramKeys.length) {
      const params = this.extractParams(paramKeys, this.keys)

      const router = this.respectDominantRouter(routers, 'post', params.slug)

      if (router) {
        contexts.push(this.createRedirectContext(router))
      } else {
        contexts.push(this.#createEntryContext(permalinkMatch, params))
      }
    }

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
  routeRegExp: RegExp
  constructor() {
    super('StaticPagesRouter')
    this.routeRegExp = pathToRegexp('/:slug/')
  }
  handle(request: string, contexts: RoutingContext[], routers: ParentRouter[]) {
    const [match, slug] = this.routeRegExp.exec(request) ?? []

    if (match && slug) {
      const router = this.respectDominantRouter(routers, 'page', slug)

      if (router) {
        contexts.push(this.createRedirectContext(router))
      } else {
        contexts.push(this.#createContext(match, { slug }))
      }
    }
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

export class RouterManager {
  config: RoutingConfigResolved
  router: ParentRouter
  routers: ParentRouter[] = []
  constructor(routingConfig: RoutingConfigResolved) {
    this.config = routingConfig
    this.router = new ParentRouter('SiteRouter')
    this.routers.push(this.router)

    /**
     * 1. Admin: Strongest inbuilt features, which you can never override.
     * 2. Static Routes: Very strong, because you can override any urls and redirect to a static route.
     * 3. Taxonomies: Stronger than collections, because it's an inbuilt feature.
     * 4. Collections
     * 5. Static Pages: Weaker than collections, because we first try to find a post slug and fallback to lookup a static page.
     * 6. Internal Apps: Weakest
     */

    // 1.
    const adminRouter = new AdminRouter()
    this.routers.push(adminRouter)

    // 2.
    const routes = Object.entries(this.config.routes ?? {}) as Entries<
      typeof this.config.routes
    >
    routes.forEach(([key, value]) => {
      const staticRoutesRouter = new StaticRoutesRouter(key, value)
      this.routers.push(staticRoutesRouter)
    })

    // 3.
    const collections = Object.entries(
      this.config.collections ?? {}
    ) as Entries<typeof this.config.collections>
    collections.forEach(([key, value]) => {
      const collectionRouter = new CollectionRouter(key, value)
      this.routers.push(collectionRouter)
    })

    // 4.
    const taxonomies = Object.entries(this.config.taxonomies ?? {}) as Entries<
      typeof this.config.taxonomies
    >
    taxonomies.forEach(([key, permalink]) => {
      const taxonomyRouter = new TaxonomyRouter(key, permalink as string)
      this.routers.push(taxonomyRouter)
    })

    // 5.
    const staticPagesRouter = new StaticPagesRouter()
    this.routers.push(staticPagesRouter)

    // mount routers into a chain of responsibilities
    this.routers.reduce((acc, router) => acc.mount(router))
  }

  handle(params: string[] | string = []): RoutingContext[] {
    if (params) {
      const request = `/${[params].flat().join('/')}/`
      const requestSlugified = `/${[params].flat().map(slugify).join('/')}/`
      if (request !== requestSlugified) {
        return [this.router.createRedirectContext(requestSlugified)]
      }
      return this.router.handle(request, [], this.routers)
    }
    return []
  }
}
