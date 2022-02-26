import { get } from '@gspenst/utils'
import type { Data } from '../types'

export function transformData(data: Data) {
  if ('getPageDocument' in data) {
    return {
      page: {
        layout: 'PageLayout',
        page: get(data, 'getPageDocument.data'),
      },
      global: get(data, 'getGlobalDocument', {}),
    } as const
  }

  if ('getPostDocument' in data) {
    return {
      page: {
        layout: 'PostLayout',
        post: get(data, 'getPostDocument.data'),
      },
      global: get(data, 'getGlobalDocument', {}),
    } as const
  }

  if ('getAuthorDocument' in data) {
    return {
      page: {
        layout: 'PageLayout',
        author: get(data, 'getAuthorDocument.data'),
      },
      global: get(data, 'getGlobalDocument', {}),
    } as const
  }
}
