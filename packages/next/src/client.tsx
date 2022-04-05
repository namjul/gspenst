import type * as React from 'react'
import { useTina } from 'tinacms/dist/edit-state'
import type { NextPage } from 'next'
import DynamicTinaProvider from './TinaDynamicProvider'
import type { PageProps } from './types'
import { resourceTypes } from './constants'

export type Props = {
  pageProps: PageProps
  Component: React.ComponentType<Omit<PageProps, 'data'> & { data: unknown }>
}

const Container: NextPage<Props> = ({
  pageProps: { data, ...props },
  Component,
}) => {
  const editableDataEntry = Object.entries(data).find(([type]) => {
    // @ts-expect-error -- fine
    return resourceTypes.includes(type)
  })

  if (!editableDataEntry) {
    throw new Error('No data was provided from getStaticProps')
  }

  const [, tinaData] = editableDataEntry

  const { data: tinaDataResolved } = useTina({
    // @ts-expect-error -- TODO fine for now
    query: tinaData?.query,
    // @ts-expect-error -- TODO fine for now
    variables: tinaData?.variables,
    // @ts-expect-error -- TODO fine for now
    data: tinaData?.data,
  })
  return <Component {...props} data={tinaDataResolved} />
}

const Page: NextPage<Props> = ({ pageProps, Component }) => {
  return (
    <DynamicTinaProvider>
      <Container pageProps={pageProps} Component={Component} />
    </DynamicTinaProvider>
  )
}

export default Page
