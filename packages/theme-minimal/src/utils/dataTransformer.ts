import { get } from '@gspenst/utils'
import type { Data } from '../types'
import headings from './getHeaders'
import type { Root } from './getHeaders'

export type TransformedDataType = ReturnType<typeof transformData>

export function transformData(data: Data) {
  const config = get(data, 'getConfigDocument', {})

  if ('getPageDocument' in data) {
    const pageDocument = get(data, 'getPageDocument')

    const { titleText } = headings(pageDocument.data.body as Root)
    const pageTitle = pageDocument.data.title || titleText || '' // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- empty string is nullish

    return {
      config,
      page: {
        layout: 'PageLayout',
        pageTitle,
        ...pageDocument,
      },
    } as const
  }

  if ('getPostDocument' in data) {
    const postDocument = get(data, 'getPostDocument')

    const { titleText } = headings(postDocument.data.body as Root)
    const pageTitle = postDocument.data.title || titleText || '' // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- empty string is nullish

    return {
      config,
      page: {
        layout: 'PostLayout',
        pageTitle,
        ...postDocument,
      },
    } as const
  }

  if ('getAuthorDocument' in data) {
    const authorDocument = get(data, 'getAuthorDocument')

    const pageTitle = authorDocument.data.title || '' // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- empty string is nullish

    return {
      config,
      page: {
        layout: 'PageLayout',
        pageTitle,
        ...authorDocument,
      },
    } as const
  }

  return {
    config,
  }
}
