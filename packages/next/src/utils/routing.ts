import slugify from 'slugify'
import deepmerge from 'deepmerge'
// import { ExperimentalGetTinaClient } from '../../.tina/__generated__/types'
// import type { Document } from '../../.tina/__generated__/types'
// import type { Resource } from '../types';
import type { RoutingConfigResolved } from './validate'

// https://github.com/sindresorhus/map-obj

export type RoutingMap = {
  paths: {
    [path: string]: {
      [key: string]: any
      // resource: Resource
      // document: Partial<Document>
      // type: 'index' | 'post' | 'page' | 'author' | 'tag' | null
      // slug: string
      // path?: string
      // template?: string
      // data?: RoutingData
    }
  }
  redirects?: {
    source: string
    destination: string
    permanent?: boolean
  }[]
}

const defaultRoutes: RoutingConfigResolved = {
  routes: {},
  collections: {
    '/': {
      permalink: '/{slug}/',
      template: 'index',
    },
  },
  taxonomies: {
    tag: '/tag/{slug}',
    author: '/author/{slug}',
  },
}

const slugifyPath = (path: string) => {
  // @ts-expect-error -- does not exactly match with map type
  return path.split('/').map(slugify).filter(Boolean).join('/')
}

async function createStaticRouteRouting(
  mainRoute: string,
  props: Exclude<RoutingConfigResolved['routes'], undefined>['']
): Promise<RoutingMap> {
  const { template } = props

  const paths = {
    [slugifyPath(mainRoute)]: {
      template,
    },
  }

  const result: RoutingMap = { paths }

  // if (data?.router) {
  //   Object.entries(data.router).forEach(([resource, routeData]) =>
  //     routeData
  //       .filter((route) => route.redirect)
  //       .forEach((route) => {
  //         // TODO if `resource` is `tag` or `author` use `taxonomies.tag` providing `rewrite.slug`
  //         // skip/filter is `resource` is `post` ?
  //         result.redirects.push({
  //           source: `/${resource}/${route.slug}`,
  //           destination: mainRoute,
  //         })
  //       })
  //   )
  // }

  return result
}

// async function createCollectionRouting() {
//
// }
//
// async function createStaticPagesRouting() {
//
// }
//
// async function createTaxonomyRouting(
//   key: 'tag' | ' author' | string,
//   permalink: string,
//   routes: DataReturnType['router'][]
// ) {
//
//   const client = ExperimentalGetTinaClient() // eslint-disable-line @babel/new-cap
//
//   // TODO creat taxonomies graphql query
//   const {
//     data: { getAuthorList: authorList },
//   } = await client.getAuthorList()
//
//   return {
//     paths
//   }
// }

export async function createRoutingMap(routingConfig?: RoutingConfigResolved) {
  routingConfig = { ...defaultRoutes, ...routingConfig }

  // collect rewrites from routingConfig
  // const existingRoutes = Object.values({
  //   ...routingConfig.routes,
  //   ...routingConfig.collections,
  // })
  //   .filter(({ data }) => data)
  //   .map(({ data }) => {
  //     return data!.router // eslint-disable-line @typescript-eslint/no-non-null-assertion
  //   })

  const routings = await Promise.all([
    // 1. Static Routes: Very strong, because you can override any urls and redirect to a static route.
    ...Object.entries(routingConfig.routes ?? {}).map(([path, props]) =>
      createStaticRouteRouting(path, props)
    ),
    // 2. Taxonomies: Stronger than collections, because it's an inbuilt feature.
    // ...Object.entries(routingConfig.taxonomies ?? {}).map(([path, props]) =>
    //   createTaxonomyRouting(path, props, existingRoutes)
    // ),
  ])

  const routingMap = routings.reduce<RoutingMap>(
    (acc, routing) => deepmerge<RoutingMap>(acc, routing),
    {
      paths: {},
      redirects: [],
    }
  )

  // const used: {
  //   [type in Split<RoutingData, '.'>[0]]: {
  //     [slug: string]: boolean
  //   }
  // } = {
  //   post: {},
  //   page: {},
  //   author: {},
  //   tag: {},
  // }

  // Object.entries(routingConfig.routes ?? {}).reduce(
  //   (acc, [path, { template, data }]) => {
  //     path = slugifyPath(path)
  //     // const [dataType, dataSlug] = (data ?? '').split('.') as Split<
  //     //   RoutingData | '',
  //     //   '.'
  //     // >
  //     //
  //     // if (!!dataType && !!dataSlug) {
  //     //   used[dataType] = {
  //     //     ...used[dataType],
  //     //     [dataSlug]: true,
  //     //   }
  //     // }
  //
  //     acc.paths[path] = {
  //       template,
  //       data,
  //     }
  //
  //     if (data?.router) {
  //       acc.rewrites.push(
  //         ...Object.entries(data.router).flatMap(([resource, rewrites]) =>
  //           rewrites
  //             .filter((rewrite) => rewrite.redirect)
  //             .map((rewrite) => {
  //               // TODO if `resource` is `tag` or `author` use `taxonomies.tag` providing `rewrite.slug`
  //               // skip/filter is `resource` is `post` ?
  //               return {
  //                 source: `/${resource}/${rewrite.slug}`,
  //                 destination: path,
  //               }
  //             })
  //         )
  //       )
  //     }
  //     return acc
  //   },
  //   result
  // )

  // const {
  //   data: { getPageList: pageList },
  // } = await client.getPageList()

  // const pageDocuments = (pageList.edges ?? []).map((page) => page?.node)

  // pageDocuments.reduce((acc, current) => {
  //   if (current) {
  //     const { sys } = current
  //     const slug = slugify(sys.filename)
  //
  //     // prevent duplicate page
  //     // if (!used.page[slug]) {
  //     acc[slug] = {
  //       type: 'page',
  //       slug,
  //       path: sys.path,
  //     }
  //     // }
  //   }
  //   return acc
  // }, result)

  // const {
  //   data: { getPostList: postList },
  // } = await client.getPostList()

  // const postDocuments = (postList.edges ?? []).map((post) => post?.node)

  // Object.entries(routingConfig.collections).reduce(
  //   (acc, [path, properties]) => {
  //     const {
  //       template,
  //       // data = undefined,
  //       permalink = undefined,
  //     } = typeof properties === 'string' ? { template: properties } : properties
  //     const slug = slugifyPath(path)
  //
  //     if (permalink) {
  //       postDocuments.reduce((innerAcc, current) => {
  //         if (current) {
  //           const { sys } = current
  //           const postSlug = slugifyPath(
  //             permalink.replace(/{\w*}/, slugify(sys.filename))
  //           )
  //           innerAcc[postSlug] = {
  //             type: 'post',
  //             slug: postSlug,
  //             path: sys.path,
  //           }
  //         }
  //         return innerAcc
  //       }, result)
  //     }
  //
  //     acc[slug] = {
  //       type: 'index',
  //       slug,
  //       // data,
  //       template,
  //     }
  //     return acc
  //   },
  //   result
  // )

  // const {
  //   data: { getAuthorList: authorList },
  // } = await client.getAuthorList()

  // const authorDocuments = (authorList.edges ?? []).map((author) => author?.node)

  // authorDocuments.reduce((acc, current) => {
  //   if (current) {
  //     const { sys } = current
  //     const slug = ['author', slugify(sys.filename)].join('/')
  //     acc[slug] = {
  //       type: 'author',
  //       slug,
  //       path: sys.path,
  //     }
  //   }
  //   return acc
  // }, result)

  return routingMap
}
