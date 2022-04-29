import path from 'path'
import type { Key } from 'path-to-regexp'
import { compilePermalink, pathToRegexp } from '../helpers'
import { ok, combine } from '../shared-kernel'
import type { Result, Option } from '../shared-kernel'
import type { RoutingContext, Request } from '../domain/routing'
import type { Taxonomy } from '../domain/routes'
import type { Taxonomies } from '../domain/taxonomy'
import { processQuery } from '../helpers/processQuery'
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
      filter: `tags:'${params?.slug ?? '%s'}'`,
      limit: this.config.limit,
    }
  }

  async resolvePaths(routers: ParentRouter[]) {
    const taxonomyQuery = {
      type: 'browse',
      resourceType: this.taxonomyKey,
      limit: 'all',
    } as const
    return (await processQuery(taxonomyQuery))
      .map(({ resources: taxonomyResources }) => {
        return combine(
          taxonomyResources
            .filter(
              (resource) =>
                !this.respectDominantRouter(
                  routers,
                  resource.resourceType,
                  resource.slug
                )
            )
            .flatMap((taxonomy) => {
              return [
                compilePermalink(this.config.permalink, taxonomy),
                ...Array.from(
                  {
                    length:
                      taxonomyResources.length /
                      (this.config.limit === 'all' ? 1 : this.config.limit),
                  },
                  (_, i) => {
                    return ok(
                      path.join(this.config.permalink, 'page', String(i + 1))
                    )
                  }
                ),
              ]
            })
        )
      })
      .andThen((x) => x)
  }
}

export default TaxonomyRouter
