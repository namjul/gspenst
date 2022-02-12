import { lightTheme, darkTheme } from '@gspenst/components'
import { ThemeProvider } from '@gspenst/next/components'
import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import type { PageProps } from '@gspenst/next'
import { get } from '@gspenst/utils'
import { LocalClient } from 'tinacms'
import getComponent from './components-registry'

export type { ThemeOptions } from './types'

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

export const getStaticPaths: GetStaticPaths = async () => {
  console.log('Page [...slug].js getStaticPaths')
  return { paths: ['/my-first-path'], fallback: false }
}

export const getStaticProps: GetStaticProps = async (context) => {
  console.log('Page [...slug].js getStaticProps, params: ', context.params)

  const client = new LocalClient()

  const query = `
query MyQuery {
  getCollections {
    documents {
      edges {
        node {
          ... on PostsDocument {
            id
          }
        }
      }
    }
  }
}
`

  const data: { [key: string]: any } = await client.request(query, {
    variables: {},
  })

  console.log('Data: ', JSON.stringify(data, null, 2))

  return { props: data }
}

export { getComponent }

export default Page
