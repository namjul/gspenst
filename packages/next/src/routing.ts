import debug from 'debug'
// import deepmerge from 'deepmerge'
import { compile, pathToRegexp } from 'path-to-regexp'
import { toArray } from './utils'
// import type { Document } from '../.tina/__generated__/types'
// import type { Resource } from './types';
import type {
  RoutingConfigResolved,
  RouteConfig,
  CollectionConfig,
} from './validate'
import type { ResourceItem } from './repository'

const log = debug('@gspenst/next:routing')

// https://github.com/sindresorhus/map-obj

export type PageProps = {}
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
export type HandleResponse = { props: PageProps } | { redirect: Redirect }

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
    routers: Router[]
  ): Promise<HandleResponse | null> {
    if (this.nextRouter) {
      return this.nextRouter.handle(request, routers)
    }

    return null
  }

  getPaths(_resources: ResourceItem[]): string[] {
    return []
  }
}

class StaticRoutesRouter extends Router {
  mainRoute: string
  regexp: RegExp
  config: RouteConfig
  constructor(mainRoute: string, config: RouteConfig) {
    super('StaticRoutesRouter')
    this.mainRoute = mainRoute
    this.config = config
    this.regexp = pathToRegexp(this.mainRoute)
    // this.data = config.data
    // this.template = config.template
  }
  async handle(request: string, routers: Router[]) {
    const result = this.regexp.exec(request)

    if (result) {
      return { props: {} }
    }
    return super.handle(request, routers)
  }
  getPaths(): string[] {
    return [this.mainRoute]
  }
}

class TaxonomyRouter extends Router {
  taxonomyKey: string
  permalink: string
  regexp: RegExp
  constructor(key: string, permalink: string) {
    super('TaxonomyRouter')
    this.taxonomyKey = key
    this.permalink = permalink
    this.regexp = pathToRegexp(this.permalink)
  }
  async handle(request: string, routers: Router[]) {
    const result = this.regexp.exec(request)

    if (result) {
      return { props: {} }
    }
    return super.handle(request, routers)
  }
  getPaths(resources: ResourceItem[]): string[] {
    const paths = resources
      .filter((resourceItem) => resourceItem.resource === this.taxonomyKey)
      .reduce<string[]>((acc, resourceItem) => {
        const path = compile(this.permalink)(resourceItem)

        if (path) {
          acc.push(path)
        }
        return acc
      }, [])
    return paths
  }
}

class CollectionRouter extends Router {
  mainRoute: string
  permalink: string
  regexp: RegExp
  constructor(mainRoute: string, config: CollectionConfig) {
    super('CollectionRouter')
    this.mainRoute = mainRoute
    this.permalink = config.permalink
    this.regexp = pathToRegexp(this.mainRoute)
  }
  async handle(request: string, routers: Router[]) {
    const result = this.regexp.exec(request)

    if (result) {
      return { props: {} }
    }
    return super.handle(request, routers)
  }
  getPaths(resources: ResourceItem[]): string[] {
    const paths = resources
      .filter((resourceItem) => resourceItem.resource === 'post')
      .reduce<string[]>((acc, resourceItem) => {
        const path = compile(this.permalink)(resourceItem)

        if (path) {
          acc.push(path)
        }
        return acc
      }, [])
    return [this.mainRoute].concat(paths)
  }
}

class StaticPagesRouter extends Router {
  constructor() {
    super('StaticPagesRouter')
  }
  getPaths(resources: ResourceItem[]): string[] {
    const paths = resources
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
  resources: ResourceItem[]
  constructor(routingConfig: RoutingConfigResolved, resources: ResourceItem[]) {
    this.resources = resources
    this.config = routingConfig
    this.router = new Router('SiteRouter')

    Object.entries(this.config.routes ?? {}).forEach(([key, value]) => {
      const staticRoutesRouter = new StaticRoutesRouter(key, value)
      this.routers.push(staticRoutesRouter)
    })

    Object.entries(this.config.collections ?? {}).forEach(([key, value]) => {
      const collectionRouter = new CollectionRouter(key, value)
      this.routers.push(collectionRouter)
    })

    const staticPagesRouter = new StaticPagesRouter()
    this.routers.push(staticPagesRouter)

    Object.entries(this.config.taxonomies ?? {}).forEach(([key, permalink]) => {
      const taxonomyRouter = new TaxonomyRouter(key, permalink)
      this.routers.push(taxonomyRouter)
    })

    // mount routers into a chain of responsibilities
    this.routers.reduce((acc, router) => acc.mount(router), this.router)

    log('Routers instantiated')
  }

  async resolvePaths(): Promise<string[]> {
    const paths = this.routers.flatMap((router) =>
      router.getPaths(this.resources)
    )
    log('Router paths: ', paths)
    return paths
  }

  async resolveProps(
    params: string[] | string = []
  ): Promise<HandleResponse | null> {
    if (params) {
      const request = `/${toArray(params).join('/')}/`
      const result = this.router.handle(request, this.routers)
      return result
    }
    return null
  }
}
