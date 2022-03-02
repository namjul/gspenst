import { get } from '@gspenst/utils'
import type { Data } from '../types'

export type PageProps = ReturnType<typeof transformData>

export function transformData(data: Data) {
  const global = get(data, 'getGlobalDocument', {})

  if ('getPageDocument' in data) {
    return {
      global,
      page: {
        layout: 'PageLayout',
        ...get(data, 'getPageDocument'),
      },
    } as const
  }

  if ('getPostDocument' in data) {
    return {
      global,
      page: {
        layout: 'PostLayout',
        ...get(data, 'getPostDocument'),
      },
    } as const
  }

  if ('getAuthorDocument' in data) {
    return {
      global,
      page: {
        layout: 'PageLayout',
        ...get(data, 'getAuthorDocument'),
      },
    } as const
  }

  return {
    global,
  }
}
