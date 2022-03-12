import slugify from 'slugify'
import type { Split } from '@gspenst/utils'
import { ExperimentalGetTinaClient } from '../../.tina/__generated__/types'
import type { Routing, RoutingData } from '../types'

export type RoutingMap = {
  [slug: string]: {
    type: 'index' | 'post' | 'page' | 'author' | 'tag' | null
    slug: string
    path?: string
    template?: string
    data?: RoutingData
  }
}

const defaultRoutes = {
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

const createSlugFromPath = (path: string) => {
  // @ts-expect-error -- does not exactly match with map type
  return path.split('/').map(slugify).filter(Boolean).join('/')
}

export async function createRoutingMap(routing?: Routing) {
  routing = { ...defaultRoutes, ...routing }

  const result: RoutingMap = {}
  const client = ExperimentalGetTinaClient() // eslint-disable-line @babel/new-cap

  const used: {
    [type in Split<RoutingData, '.'>[0]]: {
      [slug: string]: boolean
    }
  } = {
    post: {},
    page: {},
    author: {},
    tag: {},
  }

  Object.entries(routing.routes ?? {}).reduce((acc, [path, properties]) => {
    const slug = createSlugFromPath(path)
    const { template, data = undefined } =
      typeof properties === 'string' ? { template: properties } : properties
    const [dataType, dataSlug] = (data ?? '').split('.') as Split<
      RoutingData | '',
      '.'
    >

    if (!!dataType && !!dataSlug) {
      used[dataType] = {
        ...used[dataType],
        [dataSlug]: true,
      }
    }

    acc[slug] = {
      type: null,
      slug,
      data,
      template,
    }
    return acc
  }, result)

  const {
    data: { getPageList: pageList },
  } = await client.getPageList()

  const pageDocuments = (pageList.edges ?? []).map((page) => page?.node)

  pageDocuments.reduce((acc, current) => {
    if (current) {
      const { sys } = current
      const slug = slugify(sys.filename)

      // prevent duplicate page
      if (!used.page[slug]) {
        acc[slug] = {
          type: 'page',
          slug,
          path: sys.path,
        }
      }
    }
    return acc
  }, result)

  const {
    data: { getPostList: postList },
  } = await client.getPostList()

  const postDocuments = (postList.edges ?? []).map((post) => post?.node)

  Object.entries(routing.collections ?? {}).reduce(
    (acc, [path, properties]) => {
      const {
        template,
        data = undefined,
        permalink = undefined,
      } = typeof properties === 'string' ? { template: properties } : properties
      const slug = createSlugFromPath(path)

      if (permalink) {
        postDocuments.reduce((innerAcc, current) => {
          if (current) {
            const { sys } = current
            const postSlug = createSlugFromPath(
              permalink.replace(/{\w*}/, slugify(sys.filename))
            )
            innerAcc[postSlug] = {
              type: 'post',
              slug: postSlug,
              path: sys.path,
            }
          }
          return innerAcc
        }, result)
      }

      acc[slug] = {
        type: 'index',
        slug,
        data,
        template,
      }
      return acc
    },
    result
  )

  const {
    data: { getAuthorList: authorList },
  } = await client.getAuthorList()

  const authorDocuments = (authorList.edges ?? []).map((author) => author?.node)

  authorDocuments.reduce((acc, current) => {
    if (current) {
      const { sys } = current
      const slug = ['author', slugify(sys.filename)].join('/')
      acc[slug] = {
        type: 'author',
        slug,
        path: sys.path,
      }
    }
    return acc
  }, result)

  return result
}
