import path from 'path'
import debug from 'debug'
import { compile, pathToRegexp } from 'path-to-regexp'
import type { Key } from 'path-to-regexp'
import { toArray } from './utils'
import type {
  ResourceItemMap,
  ResourceItem,
  Entries,
  Taxonomies,
} from './types'

import type {
  RoutingConfigResolved,
  RouteConfig,
  CollectionConfig,
  DataQuery,
} from './validate'
import { find } from './dataUtils'

const log = debug('@gspenst/next:routing')

const POST_PER_PAGE = 5

export type Redirect =
  | {
      statusCode: 301 | 302 | 303 | 307 | 308
      destination: string
      basePath?: false
    }
  | {
      permanent: boolean
      destination: string
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
      data?: DataQuery[]
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
      data?: DataQuery[]
      templates?: string[]
      request: {
        path: string
        slug?: string | undefined
        page?: number | undefined
      }
    }
  | {
      type: 'entry'
      id: ID
      data?: DataQuery[]
      templates?: string[]
      request: {
        path: string
        slug: string
      }
    }
  | {
      type: 'custom'
      data?: DataQuery[]
      templates?: string[]
      request: {
        path: string
      }
    }
  | ({ type: 'redirect' } & Redirect)
  | null

class Router {
  name: string
  nextRouter?: Router

  constructor(name: string) {
    this.name = name
  }

  mount(router: Router) {
    this.nextRouter = router
    return router
  }

  async handle(
    request: string,
    resources: ResourceItem[],
    routers: Router[]
  ): Promise<RoutingProperties> {
    if (this.nextRouter) {
      return this.nextRouter.handle(request, resources, routers)
    }

    return null
  }

  resolvePaths(_resources: ResourceItemMap, _resourceIDs: ID[]): string[] {
    return []
  }
}

class StaticRoutesRouter extends Router {
  mainRoute: string
  routeRegExp: RegExp
  config: RouteConfig
  constructor(mainRoute: string, config: RouteConfig) {
    super('StaticRoutesRouter')
    this.mainRoute = mainRoute
    this.config = config
    this.routeRegExp = pathToRegexp(this.mainRoute)
    // this.data = config.data
    // this.template = config.template
  }
  async handle(request: string, resources: ResourceItem[], routers: Router[]) {
    const [match] = this.routeRegExp.exec(request) ?? []

    if (match) {
      return {
        type: 'custom' as const,
        templates: [],
        request: { path: match },
      }
    }
    return super.handle(request, resources, routers)
  }
  resolvePaths(): string[] {
    return [this.mainRoute]
  }
}

class TaxonomyRouter extends Router {
  taxonomyKey: Taxonomies
  permalink: string
  routeRegExp: RegExp
  constructor(key: Taxonomies, permalink: string) {
    super('TaxonomyRouter')
    this.taxonomyKey = key
    this.permalink = permalink
    this.routeRegExp = pathToRegexp(this.permalink)
  }
  async handle(request: string, resources: ResourceItem[], routers: Router[]) {
    const [match, slug] = this.routeRegExp.exec(request) ?? []

    if (match && slug) {
      const resourceItem = find(resources, { slug })
      if (resourceItem) {
        return {
          type: 'channel' as const,
          name: this.taxonomyKey,
          templates: [],
          request: {
            path: 'sdf',
          },
        }
      }
    }
    return super.handle(request, resources, routers)
  }
  resolvePaths(resources: ResourceItemMap): string[] {
    const paths = Object.values(resources)
      .filter((resourceItem) => resourceItem.resource === this.taxonomyKey)
      .reduce<string[]>((acc, resourceItem) => {
        acc.push(compile(this.permalink)(resourceItem))
        return acc
      }, [])
    return paths
  }
}

class CollectionRouter extends Router {
  mainRoute: string
  routerName: string
  permalink: string
  routeRegExp: RegExp
  permalinkRegExp: RegExp
  pagesRegExp: RegExp
  constructor(mainRoute: string, config: CollectionConfig) {
    super('CollectionRouter')
    this.mainRoute = mainRoute
    this.routerName = mainRoute === '/' ? 'index' : mainRoute.replace(/\//g, '')
    this.routeRegExp = pathToRegexp(this.mainRoute)
    this.permalink = config.permalink
    this.permalinkRegExp = pathToRegexp(this.permalink)
    this.pagesRegExp = pathToRegexp(
      path.join(`${this.mainRoute}, 'page', ':page(\\d+)'`)
    )
  }
  async handle(request: string, resources: ResourceItem[], routers: Router[]) {
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
      const resourceItem = find(resources, { slug })
      if (resourceItem) {
        return {
          type: 'entry' as const,
          id: resourceItem.id,
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
      (_, i) => path.join(this.mainRoute, 'page', String(i + 1))
    )

    return [this.mainRoute].concat(paths).concat(paginationPath)
  }
}

class StaticPagesRouter extends Router {
  resources: ResourceItem[]
  routeRegExp: RegExp
  keys: Key[] = []
  constructor(resources: ResourceItemMap) {
    super('StaticPagesRouter')
    this.resources = Object.values(resources).filter(
      (resource) => resource.resource === 'page'
    )
    this.routeRegExp = pathToRegexp(
      `/(${this.resources.map(({ slug }) => slug).join('|')})/`,
      this.keys
    )
  }
  async handle(request: string, resources: ResourceItem[], routers: Router[]) {
    const [match, slug] = this.routeRegExp.exec(request) ?? []

    if (match && slug) {
      const resourceItem = find(this.resources, { slug })
      if (resourceItem) {
        return {
          type: 'entry' as const,
          id: resourceItem.id,
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
      .filter((resourceItem) => resourceItem.resource === 'page')
      .reduce<string[]>((acc, resourceItem) => {
        acc.push(`/${resourceItem.slug}`)
        return acc
      }, [])
    return paths
  }
}

export class RouterManager {
  config: RoutingConfigResolved
  router: Router
  routers: Router[] = []
  resources: ResourceItemMap
  constructor(
    routingConfig: RoutingConfigResolved,
    resources: ResourceItemMap
  ) {
    this.resources = resources
    this.config = routingConfig
    this.router = new Router('SiteRouter')
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
      .filter(({ resource }) => resource === 'post')
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
