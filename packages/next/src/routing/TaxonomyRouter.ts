import path from 'path'
import type { Key } from 'path-to-regexp'
import { pathToRegexp } from '../helpers'
import { ok } from '../shared-kernel'
import type { Result, Option } from '../shared-kernel'
import type { RoutingContext, Request } from '../domain/routing'
import type { Taxonomy } from '../domain/routes'
import type { Taxonomies } from '../domain/taxonomy'
import type { Resource } from '../domain/resource'
import ParentRouter from './ParentRouter'

class TaxonomyRouter extends ParentRouter {
  taxonomyKey: Taxonomies
  config: Taxonomy
  permalinkRegExpResult: Result<RegExp>
  keys: Key[] = []
  constructor(key: Taxonomies, config: Taxonomy) {
    super('TaxonomyRouter')
    this.taxonomyKey = key
    this.config = config
    this.permalinkRegExpResult = pathToRegexp(
      path.join(`/${this.config.permalink}`, '{page/:page(\\d+)}?'),
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
      filter: params?.slug ? this.#replaceFilter(params.slug) : undefined,
      limit: this.config.limit,
    }
  }

  #replaceFilter(slug: string) {
    return this.config.filter.replace(/%s/g, slug)
  }

  resolvePaths(routers: ParentRouter[], resources: Resource[]) {
    const paths = resources
      .flatMap((resource) => {
        if (resource.resourceType !== this.taxonomyKey) {
          return []
        }

        if (
          this.respectDominantRouter(
            routers,
            resource.resourceType,
            resource.slug
          )
        ) {
          return []
        }

        const postResources = resources.filter(
          (_resource) =>
            _resource.resourceType === 'post' &&
            _resource.filters?.includes(this.#replaceFilter(resource.slug))
        )

        const { urlPathname } = resource

        if (urlPathname) {
          const pagesPathnames = Array.from(
            {
              length:
                postResources.length /
                (this.config.limit === 'all' ? 1 : this.config.limit),
            },
            (_, i) => {
              return path.join(urlPathname, 'page', String(i + 1))
            }
          )
          return [urlPathname, ...pagesPathnames]
        }

        return []
      })

    return paths
  }
}

export default TaxonomyRouter
