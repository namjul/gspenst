import { lightTheme, darkTheme } from '@gspenst/components'
import type { NextPage } from 'next'
import { useTina } from 'tinacms/dist/edit-state'
import { get } from '@gspenst/utils'
import type { Data, PageProps } from '../types'
import getComponent from './registry'
import { ThemeProvider } from './patterns/ThemeProvider'

// import type { PropsWithChildren } from 'react'
// import NextLink from 'next/link'
// import type { LinkProps as NextLinkProps } from 'next/link'

// const Link = (props: PropsWithChildren<NextLinkProps>) => {
//   const { children, ...linkProps } = props
//   return (
//     <NextLink {...linkProps} passHref>
//       <a href="passRef">{children}</a>
//     </NextLink>
//   )
// }

const resolveData = (data: Data) => {
  if ('getPostsList' in data) {
    return {
      layout: 'PostLayout',
      pageProps: get(data, 'getPostsList.edges')?.map(
        (edge) => edge?.node?.data
      ),
    } as const
  }

  if ('getPagesList' in data) {
    return {
      layout: 'PageLayout',
      pageProps: get(data, 'getPagesList.edges')?.map(
        (edge) => edge?.node?.data
      ),
    } as const
  }

  if ('getAuthorsList' in data) {
    return {
      layout: 'PageLayout',
      pageProps: get(data, 'getAuthorsList.edges')?.map(
        (edge) => edge?.node?.data
      ),
    } as const
  }

  if ('getPagesDocument' in data) {
    return {
      layout: 'PageLayout',
      pageProps: get(data, 'getPagesDocument.data'),
    } as const
  }

  if ('getPostsDocument' in data) {
    return {
      layout: 'PostLayout',
      pageProps: get(data, 'getPostsDocument.data'),
    } as const
  }

  if ('getAuthorsDocument' in data) {
    return {
      layout: 'PageLayout',
      pageProps: get(data, 'getAuthorsDocument.data'),
    } as const
  }

  return {
    layout: 'PageLayout',
    pageProps: {},
  } as const
}

const Page: NextPage<PageProps> = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  const { layout, pageProps } = resolveData(data)

  const PageLayout = getComponent(layout)

  if (!PageLayout) {
    throw new Error(`no page layout matching the layout: ${layout}`)
  }

  return (
    <ThemeProvider light={lightTheme} dark={darkTheme}>
      {/* @ts-expect-error -- PageLayout is dynamically retrieved */}
      <PageLayout {...pageProps} />
    </ThemeProvider>
  )
}

export default Page
