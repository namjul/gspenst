import path from 'path'
import debug from 'debug'
import { compile, pathToRegexp } from 'path-to-regexp'
import type { Key } from 'path-to-regexp'
import { toArray } from './utils'
import type {
  ResourceItemMap,
  ResourceItem,
  ResourceType,
  Entries,
  Taxonomies,
} from './types'

import type {
  RoutingConfigResolved,
  RouteConfig,
  CollectionConfig,
  Data,
  DataQuery,
} from './validate'
import { find } from './dataUtils'

const log = debug('@gspenst/next:routing')

const POST_PER_PAGE = 5

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

export type RoutingProperties =
  | {
      type: 'collection'
      name: string
      options?: {
        filter?: string
        order?: string
        limit?: string
      }
      data?: {
        [key: string]: DataQuery
      }
      templates?: string[]
      request: {
        path: string
        slug?: string | undefined
        page?: number | undefined
      }
    }
  | {
      type: 'channel'
      name: string
      data?: {
        [key: string]: DataQuery
      }
      templates?: string[]
      request: {
        path: string
        slug?: string | undefined
        page?: number | undefined
      }
    }
  | {
      type: 'entry'
      resourceItem: Pick<ResourceItem, 'id' | 'resourceType'>
      templates?: string[]
      request: {
        path: string
        slug: string
      }
    }
  | {
      type: 'custom'
      data?: {
        [key: string]: DataQuery
      }
      templates?: string[]
      request: {
        path: string
      }
    }
  | ({ type: 'redirect' } & Redirect)
  | null

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

  async handle(
    request: string,
    resources: ResourceItem[],
    routers: ParentRouter[]
  ): Promise<RoutingProperties> {
    if (this.nextRouter) {
      return this.nextRouter.handle(request, resources, routers)
    }

    return null
  }

  resolvePaths(_resources: ResourceItemMap, _resourceIDs: ID[]): string[] {
    return []
  }

  respectDominantRouter(
    routers: ParentRouter[],
    resourceType: ResourceType,
    slug: string
  ): ParentRouter | undefined {
    return routers.find((router) =>
      router.isRedirectEnabled(resourceType, slug)
    )
  }

  isRedirectEnabled(resourceType: ResourceType, slug: string): boolean {
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

  getRoute() {
    // return urlUtils.createUrl(this.route)
    return this.route ?? '/'
  }
}

class StaticRoutesRouter extends ParentRouter {
  routeRegExp: RegExp
  config: RouteConfig
  constructor(mainRoute: string, config: RouteConfig) {
    super('StaticRoutesRouter', config.data)
    this.route = mainRoute
    this.config = config
    this.routeRegExp = pathToRegexp(this.route)
  }
  async handle(
    request: string,
    resources: ResourceItem[],
    routers: ParentRouter[]
  ) {
    const [match] = this.routeRegExp.exec(request) ?? []

    if (match) {
      return {
        type: 'custom' as const,
        templates: [...toArray(this.config.template ?? [])],
        request: { path: match },
      }
    }
    return super.handle(request, resources, routers)
  }
  resolvePaths(): string[] {
    return [this.getRoute()]
  }
}

class TaxonomyRouter extends ParentRouter {
  taxonomyKey: Taxonomies
  permalink: string
  routeRegExp: RegExp
  pagesRegExp: RegExp
  constructor(key: Taxonomies, permalink: string) {
    super('TaxonomyRouter')
    this.taxonomyKey = key
    this.permalink = permalink
    this.routeRegExp = pathToRegexp(this.permalink)
    this.pagesRegExp = pathToRegexp(
      path.join(`/${this.taxonomyKey}`, 'page', ':page(\\d+)')
    )
  }
  async handle(
    request: string,
    resources: ResourceItem[],
    routers: ParentRouter[]
  ) {
    const [pageMatch, page] = this.pagesRegExp.exec(request) ?? []

    if (pageMatch && page) {
      return {
        type: 'channel' as const,
        name: this.taxonomyKey,
        options: {},
        request: { path: pageMatch, page: Number(page) },
        templates: [],
      }
    }

    const [routeMatch, slug] = this.routeRegExp.exec(request) ?? []

    if (routeMatch && slug) {
      // CASE check if its redirected
      const router = this.respectDominantRouter(routers, this.taxonomyKey, slug)

      if (router) {
        return {
          type: 'redirect' as const,
          destination: router.getRoute(),
          statusCode: 301 as const,
        }
      }

      const resourceItem = find(resources, { slug })
      if (resourceItem) {
        return {
          type: 'channel' as const,
          name: this.taxonomyKey,
          templates: [],
          request: {
            path: routeMatch,
          },
        }
      }
    }
    return super.handle(request, resources, routers)
  }

  resolvePaths(resources: ResourceItemMap): string[] {
    const paths = Object.values(resources)
      .filter((resourceItem) => resourceItem.resourceType === this.taxonomyKey)
      .reduce<string[]>((acc, resourceItem) => {
        acc.push(compile(this.permalink)(resourceItem))
        return acc
      }, [])
    return paths
  }
}

class CollectionRouter extends ParentRouter {
  routerName: string
  permalink: string
  routeRegExp: RegExp
  permalinkRegExp: RegExp
  pagesRegExp: RegExp
  constructor(mainRoute: string, config: CollectionConfig) {
    super('CollectionRouter', config.data)
    this.route = mainRoute
    this.routerName = mainRoute === '/' ? 'index' : mainRoute.replace(/\//g, '')
    this.routeRegExp = pathToRegexp(this.route)
    this.permalink = config.permalink
    this.permalinkRegExp = pathToRegexp(this.permalink)
    this.pagesRegExp = pathToRegexp(
      path.join(this.route, 'page', ':page(\\d+)')
    )
  }
  async handle(
    request: string,
    resources: ResourceItem[],
    routers: ParentRouter[]
  ) {
    const [routeMatch] = this.routeRegExp.exec(request) ?? []

    if (routeMatch) {
      return {
        type: 'collection' as const,
        name: this.routerName,
        options: {},
        request: { path: routeMatch },
        templates: [],
      }
    }

    const [pageMatch, page] = this.pagesRegExp.exec(request) ?? []

    if (pageMatch && page) {
      return {
        type: 'collection' as const,
        name: this.routerName,
        options: {},
        request: { path: pageMatch, page: Number(page) },
        templates: [],
      }
    }

    const [permalinkMatch, slug] = this.permalinkRegExp.exec(request) ?? []

    if (permalinkMatch && slug) {
      // CASE check if its redirected
      const router = this.respectDominantRouter(routers, 'post', slug)

      if (router) {
        return {
          type: 'redirect' as const,
          destination: router.getRoute(),
          statusCode: 301 as const,
        }
      }

      const resourceItem = find(resources, { slug, resourceType: 'post' })
      if (resourceItem) {
        return {
          type: 'entry' as const,
          resourceItem: {
            id: resourceItem.id,
            resourceType: resourceItem.resourceType,
          },
          request: { path: permalinkMatch, slug },
          templates: [],
        }
      }
    }

    return super.handle(request, resources, routers)
  }
  resolvePaths(resources: ResourceItemMap, postStack: ID[]): string[] {
    const paths: string[] = []
    const collectionPosts: ResourceItem[] = []
    for (let len = postStack.length - 1; len >= 0; len -= 1) {
      const resourceItemID = postStack[len]
      const resourceItem = resourceItemID && resources[resourceItemID]
      if (resourceItem) {
        collectionPosts.push(resourceItem)
        const isOwned = true // TODO filter using filter option `const isOwned = this.nql.queryJSON(resource)`
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (isOwned) {
          paths.push(compile(this.permalink)(resourceItem))

          // Remove owned resourceItem
          postStack.splice(len, 1)
        }
      }
    }

    const paginationPath = Array.from(
      { length: collectionPosts.length / POST_PER_PAGE },
      (_, i) => path.join(this.getRoute(), 'page', String(i + 1))
    )

    return [this.getRoute()].concat(paths).concat(paginationPath)
  }
}

class StaticPagesRouter extends ParentRouter {
  resources: ResourceItem[]
  routeRegExp: RegExp
  keys: Key[] = []
  constructor(resources: ResourceItemMap) {
    super('StaticPagesRouter')
    this.resources = Object.values(resources).filter(
      (resource) => resource.resourceType === 'page'
    )
    this.routeRegExp = pathToRegexp(
      `/(${this.resources.map(({ slug }) => slug).join('|')})/`,
      this.keys
    )
  }
  async handle(
    request: string,
    resources: ResourceItem[],
    routers: ParentRouter[]
  ) {
    const [match, slug] = this.routeRegExp.exec(request) ?? []

    if (match && slug) {
      // CASE check if its redirected
      const router = this.respectDominantRouter(routers, 'page', slug)

      if (router) {
        return {
          type: 'redirect' as const,
          destination: router.getRoute(),
          statusCode: 301 as const,
        }
      }

      const resourceItem = find(this.resources, { slug, resourceType: 'page' })
      if (resourceItem) {
        return {
          type: 'entry' as const,
          resourceItem: {
            id: resourceItem.id,
            resourceType: resourceItem.resourceType,
          },
          request: {
            path: match,
            slug,
          },
          templates: [],
        }
      }
    }
    return super.handle(request, resources, routers)
  }
  resolvePaths(resources: ResourceItemMap): string[] {
    const paths = Object.values(resources)
      .filter((resourceItem) => resourceItem.resourceType === 'page')
      .reduce<string[]>((acc, resourceItem) => {
        acc.push(`/${resourceItem.slug}`)
        return acc
      }, [])
    return paths
  }
}

export class RouterManager {
  config: RoutingConfigResolved
  router: ParentRouter
  routers: ParentRouter[] = []
  resources: ResourceItemMap
  constructor(
    routingConfig: RoutingConfigResolved,
    resources: ResourceItemMap
  ) {
    this.resources = resources
    this.config = routingConfig
    this.router = new ParentRouter('SiteRouter')
    this.routers.push(this.router)

    const routes = Object.entries(this.config.routes ?? {}) as Entries<
      typeof this.config.routes
    >
    routes.forEach(([key, value]) => {
      const staticRoutesRouter = new StaticRoutesRouter(key as string, value)
      this.routers.push(staticRoutesRouter)
    })

    const collections = Object.entries(
      this.config.collections ?? {}
    ) as Entries<typeof this.config.collections>
    collections.forEach(([key, value]) => {
      const collectionRouter = new CollectionRouter(key as string, value)
      this.routers.push(collectionRouter)
    })

    const staticPagesRouter = new StaticPagesRouter(this.resources)
    this.routers.push(staticPagesRouter)

    const taxonomies = Object.entries(this.config.taxonomies ?? {}) as Entries<
      typeof this.config.taxonomies
    >
    taxonomies.forEach(([key, permalink]) => {
      const taxonomyRouter = new TaxonomyRouter(key, permalink as string)
      this.routers.push(taxonomyRouter)
    })

    // mount routers into a chain of responsibilities
    this.routers.reduce((acc, router) => acc.mount(router))

    log('Routers instantiated')
  }

  async resolvePaths(): Promise<string[]> {
    const postStack = Object.values(this.resources)
      .filter(({ resourceType }) => resourceType === 'post')
      .map(({ id }) => id)
    const paths = this.routers.flatMap((router) =>
      router.resolvePaths(this.resources, postStack)
    )
    log('Router paths: ', paths)
    return paths
  }

  async handle(params: string[] | string = []): Promise<RoutingProperties> {
    if (params) {
      const request = `/${toArray(params).join('/')}/`
      const result = this.router.handle(
        request,
        Object.values(this.resources),
        this.routers
      )
      return result
    }
    return null
  }
}
