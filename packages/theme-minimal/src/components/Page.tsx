import { lightTheme, darkTheme } from '@gspenst/components'
import { ThemeProvider } from '@gspenst/next/components'
import type { PageProps } from '@gspenst/next'
import type { NextPage } from 'next'
import { get } from '@gspenst/utils'
import getComponent from '../componentsRegistry'

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

const Page: NextPage<PageProps> = (pageProps) => {
  console.log('pageProps', pageProps)

  const layout = get(pageProps.entry, '__metadata.modelName', 'page')

  const PageLayout = getComponent(layout)

  if (!PageLayout) {
    throw new Error(`no page layout matching the layout: ${layout}`)
  }

  return (
    <ThemeProvider light={lightTheme} dark={darkTheme}>
      <PageLayout {...pageProps} />
    </ThemeProvider>
  )
}

export default Page
