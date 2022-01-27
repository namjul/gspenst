import type { GetStaticProps, GetStaticPaths } from 'next'
import { getAllPaths, getPageProps } from '@gspenst/next/server'
import { Page } from '@gspenst/theme-minimal'

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

// const Pagex = dynamic(() => import('@gspenst/theme-minimal'))

export const getStaticPaths: GetStaticPaths = async () => {
  console.log('Page [...slug].js getStaticPaths')
  const paths = await getAllPaths()
  console.log(paths)
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async (context) => {
  console.log('Page [...slug].js getStaticProps, params: ', context.params)
  const props = await getPageProps(context)
  return { props }
}

export default Page
