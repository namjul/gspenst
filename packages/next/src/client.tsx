import type * as React from 'react'
import { useTina } from 'tinacms/dist/edit-state'
import type { NextPage } from 'next'
import DynamicTinaProvider from './TinaDynamicProvider'
import type { PageProps } from './types'
import { assertUnreachable } from './helpers'

export type Props = {
  pageProps: PageProps
  Component: React.ComponentType<PageProps & { entry: unknown }>
}

const Container: NextPage<Props> = ({ pageProps, Component }) => {
  const tinaData = (() => {
    const { context } = pageProps
    switch (context) {
      case 'page':
        return pageProps.data.page
      case 'post':
        return pageProps.data.post
      case 'author':
        return pageProps.data.author
      case 'tag':
        return pageProps.data.tag
      case 'index':
      case 'home':
      case 'paged':
        return pageProps.data.posts[0]

      default:
        return assertUnreachable(context)
    }
  })() // Immediately invoke the function

  if (!tinaData) {
    throw new Error('No data was provided from getStaticProps')
  }

  const { data } = useTina({
    query: tinaData.query,
    variables: tinaData.variables,
    data: tinaData.data,
  })
  return <Component {...pageProps} entry={data} />
}

const Page: NextPage<Props> = ({ pageProps, Component }) => {
  return (
    <DynamicTinaProvider>
      <Container pageProps={pageProps} Component={Component} />
    </DynamicTinaProvider>
  )
}

export default Page
