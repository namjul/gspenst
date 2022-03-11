import slugify from 'slugify'
import type { Split, LiteralUnion } from '@gspenst/utils'
import { ExperimentalGetTinaClient } from '../../.tina/__generated__/types'
import type { Routing, RoutingData } from '../types'

export type RoutingMap = {
  [slug: string]: {
    slug: string
    path?: string
    template?: string
    data?: RoutingData
  }
}

export async function createRoutingMap(routing?: Routing) {
  const result: RoutingMap = {}
  const client = ExperimentalGetTinaClient() // eslint-disable-line @babel/new-cap

  const used: {
    [type in Split<LiteralUnion<RoutingData, string>, '.'>[0]]: {
      [slug: string]: boolean
    }
  } = {
    post: {},
    page: {},
    author: {},
    tag: {},
  }

  Object.entries(routing?.routes ?? {}).reduce((acc, [path, properties]) => {
    // @ts-expect-error -- does not exactly match with map type
    const slug = path.split('/').map(slugify).filter(Boolean).join('/')
    const { template, data = undefined } =
      typeof properties === 'string' ? { template: properties } : properties
    const [dataType, dataSlug] = (data ?? '').split('.') as Split<
      LiteralUnion<RoutingData | '', string>,
      '.'
    >

    if (!!dataType && !!dataSlug) {
      used[dataType] = {
        ...used[dataType],
        [dataSlug]: true,
      }
    }

    acc[slug] = {
      slug,
      template,
      data,
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

  postDocuments.reduce((acc, current) => {
    if (current) {
      const { sys } = current
      const slug = slugify(sys.filename)
      acc[slug] = {
        slug,
        path: sys.path,
      }
    }
    return acc
  }, result)

  const {
    data: { getAuthorList: authorList },
  } = await client.getAuthorList()

  const authorDocuments = (authorList.edges ?? []).map((author) => author?.node)

  authorDocuments.reduce((acc, current) => {
    if (current) {
      const { sys } = current
      const slug = ['author', slugify(sys.filename)].join('/')
      acc[slug] = {
        slug,
        path: sys.path,
      }
    }
    return acc
  }, result)

  return result
}
