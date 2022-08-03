import path from 'path'
import type { Key } from 'path-to-regexp'
import { ok } from '../shared/kernel'
import type { Request } from '../domain/routing'
import type { Taxonomy } from '../domain/routes'
import type { Taxonomies } from '../domain/taxonomy'
import type { Resource } from '../domain/resource'
import type { RouteCb } from './ParentRouter'
import ParentRouter from './ParentRouter'

class TaxonomyRouter extends ParentRouter {
  taxonomyKey: Taxonomies
  config: Taxonomy
  keys: Key[] = []
  constructor(key: Taxonomies, config: Taxonomy) {
    super('TaxonomyRouter')
    this.taxonomyKey = key
    this.config = config

    this.mountRoute(
      `${this.trimRoute(this.config.permalink)}/page/:page(\\d+)`,
      this.#handleRoute
    )

    this.mountRoute(this.config.permalink, this.#handleRoute)
  }

  /**
   * handles:
   *  - `/tags/:slug`
   *  - `/tags/:slug/page/:page`
   */
  #handleRoute: RouteCb = ({ match, matches, keys }, routers) => {
    const paramsResult = this.extractParams(matches, keys)

    if (paramsResult.isOk()) {
      const params = paramsResult.value
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
  }

  #createContext(_path: string, params: Request['params'] = {}) {
    const taxonomyQuery = {
      type: 'read' as const,
      resourceType: 'tag' as const,
      slug: params.slug,
    }
    return {
      type: 'channel' as const,
      name: this.taxonomyKey,
      request: {
        path: _path,
        params,
      },
      templates: [],
      data: {
        ...this.data?.query,
        [this.taxonomyKey]: taxonomyQuery,
      },
      filter: params.slug ? this.#replaceFilter(params.slug) : undefined,
      limit: this.config.limit,
    }
  }

  #replaceFilter(slug: string) {
    return this.config.filter.replace(/%s/g, slug)
  }

  resolvePaths(routers: ParentRouter[], resources: Resource[]) {
    const paths = resources.flatMap((resource) => {
      if (resource.type !== this.taxonomyKey) {
        return []
      }

      if (this.respectDominantRouter(routers, resource.type, resource.slug)) {
        return []
      }

      const postResources = resources.filter(
        (_resource) =>
          _resource.type === 'post' &&
          _resource.filters.includes(this.#replaceFilter(resource.slug))
      )

      const { path: resourcePath } = resource

      const pages =
        postResources.length > 0
          ? Math.ceil(
              postResources.length /
                (this.config.limit === 'all'
                  ? postResources.length
                  : this.config.limit)
            )
          : 0

      if (resourcePath) {
        const pagesPathnames = Array.from(
          {
            length: pages,
          },
          (_, i) => {
            return path.join(resourcePath, 'page', String(i + 1))
          }
        )
        return [resourcePath, ...pagesPathnames]
      }

      return []
    })

    return paths
  }
}

export default TaxonomyRouter
