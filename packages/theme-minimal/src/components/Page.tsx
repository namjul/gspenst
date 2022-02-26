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
  if ('getPostList' in data) {
    return {
      layout: 'PostLayout',
      pageProps: get(data, 'getPostList.edges')?.map(
        (edge) => edge?.node?.data
      ),
    } as const
  }

  if ('getPageList' in data) {
    return {
      layout: 'PageLayout',
      pageProps: get(data, 'getPageList.edges')?.map(
        (edge) => edge?.node?.data
      ),
    } as const
  }

  if ('getAuthorList' in data) {
    return {
      layout: 'PageLayout',
      pageProps: get(data, 'getAuthorList.edges')?.map(
        (edge) => edge?.node?.data
      ),
    } as const
  }

  if ('getPageDocument' in data) {
    return {
      layout: 'PageLayout',
      pageProps: get(data, 'getPageDocument.data'),
    } as const
  }

  if ('getPostDocument' in data) {
    return {
      layout: 'PostLayout',
      pageProps: get(data, 'getPostDocument.data'),
    } as const
  }

  if ('getAuthorDocument' in data) {
    return {
      layout: 'PageLayout',
      pageProps: get(data, 'getAuthorDocument.data'),
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
