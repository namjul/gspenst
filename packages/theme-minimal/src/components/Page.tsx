import { lightTheme, darkTheme } from '@gspenst/components'
import type { NextPage } from 'next'
import { useTina } from 'tinacms/dist/edit-state'
import type { Data } from '../types'
import { transformData } from '../utils/dataTransformer'
import { ThemeProvider } from './patterns/ThemeProvider'
import getComponent from './registry'

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

const Page: NextPage<{
  data: Data
  query: string
  variables: { [key: string]: any }
}> = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  const { page, global } = transformData(data) ?? {}

  const PageLayout = getComponent(page?.layout)

  if (!PageLayout) {
    throw new Error(`no page layout matching the layout: ${page?.layout}`)
  }

  return (
    <ThemeProvider light={lightTheme} dark={darkTheme}>
      {/* @ts-expect-error -- PageLayout is dynamically retrieved */}
      <PageLayout page={page} global={global} />
    </ThemeProvider>
  )
}

export default Page
