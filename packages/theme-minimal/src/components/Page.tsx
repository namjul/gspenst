import { lightTheme, darkTheme } from '@gspenst/components'
import type { NextPage } from 'next'
import { useTina } from 'tinacms/dist/edit-state'
import { transformData } from '../utils/dataTransformer'
import type { StaticProps } from '../utils/staticPropsResolver'
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

const Page: NextPage<StaticProps> = (props) => {
  if (typeof props === 'undefined') {
    throw new Error('TODO')
  }

  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  const { page, global } = transformData(data)

  const { layout } = page ?? {}

  const PageLayout = getComponent(layout)

  if (!PageLayout) {
    throw new Error(`no page layout matching the layout: ${page?.layout}`)
  }

  return (
    <ThemeProvider light={lightTheme} dark={darkTheme}>
      <PageLayout
        global={global}
        /* @ts-expect-error -- PageLayout is dynamically retrieved */
        page={page}
      />
    </ThemeProvider>
  )
}

export default Page
