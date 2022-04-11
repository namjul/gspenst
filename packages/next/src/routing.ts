import path from 'path'
import { slugify } from '@tryghost/string'
import debug from 'debug'
import { compile, pathToRegexp } from 'path-to-regexp'
import type { Key } from 'path-to-regexp'
import { toArray } from './utils'
import type {
  ResourceItem,
  PageResourceItem,
  ConfigResourceItem,
  ResourceType,
  RoutingContextType,
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
import { find, createDynamicVariables } from './dataUtils'

const log = debug('@gspenst/next:routing')

const POST_PER_PAGE = 5

type EntryResourceItem = Exclude<ResourceItem, ConfigResourceItem>
type EntryResourceItemMap = { [id: ID]: EntryResourceItem }

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
  slug?: string | undefined
  page?: number | undefined
}

export type RoutingContext =
  | {
      type: Extract<RoutingContextType, 'collection'>
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
      request: Request
    }
  | {
      type: Extract<RoutingContextType, 'channel'>
      name: string
      data?: {
        [key: string]: DataQuery
      }
      templates?: string[]
      request: Request
    }
  | {
      type: Extract<RoutingContextType, 'entry'>
      resourceItem: Pick<ResourceItem, 'id' | 'resourceType'>
      templates?: string[]
      request: Request
    }
  | {
      type: Extract<RoutingContextType, 'custom'>
      data?: {
        [key: string]: DataQuery
      }
      templates?: string[]
      request: Request
    }
  | ({ type: Extract<RoutingContextType, 'redirect'> } & Redirect)
  | { type: Extract<RoutingContextType, 'internal'> }
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
    resources: EntryResourceItem[],
    routers: ParentRouter[]
  ): Promise<RoutingContext> {
    if (this.nextRouter) {
      return this.nextRouter.handle(request, resources, routers)
    }

    return null
  }

  resolvePaths(_resources: EntryResourceItemMap, _resourceIDs: ID[]): string[] {
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

  createRedirectContext(router: ParentRouter | string) {
    return {
      type: 'redirect' as const,
      destination: typeof router === 'string' ? router : router.getRoute(),
      statusCode: 301 as const,
    }
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

class AdminRouter extends ParentRouter {
  routeRegExp: RegExp
  constructor() {
    super('AdminRouter')
    this.routeRegExp = pathToRegexp('/admin')
  }
  async handle(
    request: string,
    resources: EntryResourceItem[],
    routers: ParentRouter[]
  ) {
    const [match] = this.routeRegExp.exec(request) ?? []

    if (match) {
      return {
        type: 'internal' as const,
      }
    }
    return super.handle(request, resources, routers)
  }
  resolvePaths(): string[] {
    return ['/admin']
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
    resources: EntryResourceItem[],
    routers: ParentRouter[]
  ) {
    const [match] = this.routeRegExp.exec(request) ?? []

    if (match) {
      return this.#createContext(match)
    }
    return super.handle(request, resources, routers)
  }
  #createContext(_path: string) {
    return {
      type: 'custom' as const,
      templates: [...toArray(this.config.template ?? [])],
      request: { path: _path },
    }
  }
  resolvePaths(): string[] {
    return [this.getRoute()]
  }
}

class TaxonomyRouter extends ParentRouter {
  taxonomyKey: Taxonomies
  permalink: string
  permalinkRegExp: RegExp
  pagesRegExp: RegExp
  keys: Key[] = []
  constructor(key: Taxonomies, permalink: string) {
    super('TaxonomyRouter')
    this.taxonomyKey = key
    this.permalink = permalink
    this.permalinkRegExp = pathToRegexp(this.permalink, this.keys)
    this.pagesRegExp = pathToRegexp(
      path.join(`/${this.taxonomyKey}`, 'page', ':page(\\d+)')
    )
  }
  async handle(
    request: string,
    resources: EntryResourceItem[],
    routers: ParentRouter[]
  ) {
    const [pageMatch, page] = this.pagesRegExp.exec(request) ?? []

    if (pageMatch && page) {
      return this.#createContext(pageMatch, Number(page))
    }

    const [permalinkMatch, ...dynamicVariables] =
      this.permalinkRegExp.exec(request) ?? []

    if (permalinkMatch && dynamicVariables.length) {
      const dynamicVariable = createDynamicVariables(
        dynamicVariables,
        this.keys
      )

      const resourceItem = find(resources, {
        ...dynamicVariable,
        resourceType: this.taxonomyKey,
      }) // TODO use queryFilter

      if (resourceItem) {
        // CASE check if its redirected
        const router = this.respectDominantRouter(
          routers,
          this.taxonomyKey,
          resourceItem.slug
        )

        if (router) {
          return this.createRedirectContext(router)
        }

        return this.#createContext(permalinkMatch)
      }
    }
    return super.handle(request, resources, routers)
  }

  #createContext(_path: string, page?: number) {
    return {
      type: 'channel' as const,
      name: this.taxonomyKey,
      options: {},
      request: {
        path: _path,
        page,
      },
      templates: [],
    }
  }

  resolvePaths(resources: EntryResourceItemMap): string[] {
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
  config: CollectionConfig
  keys: Key[] = []
  constructor(mainRoute: string, config: CollectionConfig) {
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
  async handle(
    request: string,
    resources: EntryResourceItem[],
    routers: ParentRouter[]
  ) {
    const [routeMatch] = this.routeRegExp.exec(request) ?? []

    if (routeMatch) {
      return this.#createEntriesContext(routeMatch)
    }

    const [pageMatch, page] = this.pagesRegExp.exec(request) ?? []

    if (pageMatch && page) {
      return this.#createEntriesContext(pageMatch, Number(page))
    }

    const [permalinkMatch, ...dynamicVariables] =
      this.permalinkRegExp.exec(request) ?? []

    if (permalinkMatch && dynamicVariables.length) {
      const dynamicVariable = createDynamicVariables(
        dynamicVariables,
        this.keys
      )

      const resourceItem = find(resources, {
        ...dynamicVariable,
        resourceType: 'post',
      }) // TODO use queryFilter

      if (resourceItem) {
        // CASE check if its redirected
        const router = this.respectDominantRouter(
          routers,
          'post',
          resourceItem.slug
        )

        if (router) {
          return this.createRedirectContext(router)
        }

        return this.#createEntryContext(permalinkMatch, resourceItem)
      }
    }

    return super.handle(request, resources, routers)
  }

  #createEntriesContext(_path: string, page?: number) {
    return {
      type: 'collection' as const,
      name: this.routerName,
      options: {},
      request: { path: _path, page },
      templates: [...toArray(this.config.template ?? [])],
    }
  }

  #createEntryContext(_path: string, resourceItem: EntryResourceItem) {
    return {
      type: 'entry' as const,
      resourceItem: {
        id: resourceItem.id,
        resourceType: resourceItem.resourceType,
      },
      request: { path: _path, slug: resourceItem.slug },
      templates: [...toArray(this.config.template ?? [])],
    }
  }

  resolvePaths(resources: EntryResourceItemMap, postStack: ID[]): string[] {
    const paths: string[] = []
    const collectionPosts: EntryResourceItem[] = []
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
  resources: PageResourceItem[]
  routeRegExp: RegExp
  keys: Key[] = []
  constructor(resources: EntryResourceItemMap) {
    super('StaticPagesRouter')
    this.resources = Object.values(resources).filter(
      (resource): resource is PageResourceItem =>
        resource.resourceType === 'page'
    )
    this.routeRegExp = pathToRegexp(
      `/(${this.resources.map(({ slug }) => slug).join('|')})/`,
      this.keys
    )
  }
  async handle(
    request: string,
    resources: EntryResourceItem[],
    routers: ParentRouter[]
  ) {
    const [match, slug] = this.routeRegExp.exec(request) ?? []

    if (match && slug) {
      // CASE check if its redirected
      const router = this.respectDominantRouter(routers, 'page', slug)

      if (router) {
        return this.createRedirectContext(router)
      }

      const resourceItem = find(this.resources, { slug, resourceType: 'page' })
      if (resourceItem) {
        return this.#createContext(match, resourceItem)
      }
    }
    return super.handle(request, resources, routers)
  }

  #createContext(_path: string, resourceItem: EntryResourceItem) {
    return {
      type: 'entry' as const,
      resourceItem: {
        id: resourceItem.id,
        resourceType: resourceItem.resourceType,
      },
      request: {
        path: _path,
        slug: resourceItem.slug,
      },
      templates: [],
    }
  }

  resolvePaths(resources: EntryResourceItemMap): string[] {
    const paths = Object.values(resources)
      .filter(
        (resourceItem): resourceItem is PageResourceItem =>
          resourceItem.resourceType === 'page'
      )
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
  resources: EntryResourceItemMap
  constructor(
    routingConfig: RoutingConfigResolved,
    resources: { [id: ID]: ResourceItem }
  ) {
    this.resources = Object.fromEntries(
      Object.entries(resources).filter(
        (resource): resource is [ID, EntryResourceItem] =>
          resource[1].resourceType !== 'config'
      )
    )
    this.config = routingConfig
    this.router = new ParentRouter('SiteRouter')
    this.routers.push(this.router)

    const adminRouter = new AdminRouter()
    this.routers.push(adminRouter)

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

  async handle(params: string[] | string = []): Promise<RoutingContext> {
    if (params) {
      const request = `/${toArray(params).join('/')}/`
      const requestSlugified = `/${toArray(params).map(slugify).join('/')}/`
      if (request !== requestSlugified) {
        return this.router.createRedirectContext(requestSlugified)
      }
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
