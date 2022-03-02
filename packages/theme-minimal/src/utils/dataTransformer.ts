import { get } from '@gspenst/utils'
import type { Data } from '../types'

export type TransformedDataType = ReturnType<typeof transformData>

export function transformData(data: Data) {
  const config = get(data, 'getConfigDocument', {})

  if ('getPageDocument' in data) {
    return {
      config,
      page: {
        layout: 'PageLayout',
        ...get(data, 'getPageDocument'),
      },
    } as const
  }

  if ('getPostDocument' in data) {
    return {
      config,
      page: {
        layout: 'PostLayout',
        ...get(data, 'getPostDocument'),
      },
    } as const
  }

  if ('getAuthorDocument' in data) {
    return {
      config,
      page: {
        layout: 'PageLayout',
        ...get(data, 'getAuthorDocument'),
      },
    } as const
  }

  return {
    config,
  }
}
