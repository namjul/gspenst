import type * as React from 'react'
import { useTina } from 'tinacms/dist/edit-state'
import type { NextPage } from 'next'
import DynamicTinaProvider from './TinaDynamicProvider'
import type { PageProps } from './types'

export type Props = {
  pageProps: PageProps
  Component: React.ComponentType<PageProps & { entry: unknown }>
}

const Container: NextPage<Props> = ({ pageProps, Component }) => {
  const tinaData = pageProps.data.entry

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
