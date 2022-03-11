import slugify from 'slugify'
import { ExperimentalGetTinaClient } from '../../.tina/__generated__/types'
// import type { Routing } from '../types'

export type RoutingMap = {
  [slug: string]: {
    slug: string
    type: string
    path: string
    template?: string
    data?: string
  }
}

export async function createRoutingMap(/* routing?: Routing */) {
  const result: RoutingMap = {}
  const client = ExperimentalGetTinaClient() // eslint-disable-line @babel/new-cap

  const {
    data: { getPageList: pageList },
  } = await client.getPageList()

  const pageDocuments = (pageList.edges ?? []).map((page) => page?.node)

  pageDocuments.reduce((acc, current) => {
    if (current) {
      const { sys } = current
      const slug = slugify(sys.filename)
      acc[slug] = {
        slug,
        type: 'page',
        path: sys.path,
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
        type: 'post',
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
        type: 'author',
        path: sys.path,
      }
    }
    return acc
  }, result)

  return result
}
