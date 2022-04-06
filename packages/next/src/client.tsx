import type * as React from 'react'
import { useTina } from 'tinacms/dist/edit-state'
import type { NextPage } from 'next'
import { isValidElementType } from 'react-is'
import DynamicTinaProvider from './TinaDynamicProvider'
import getComponent from './componentRegistry'
import type { PageProps } from './types'
import type { PageProps as InternalPageProps } from './controller'

export type ContainerProps = {
  pageProps: PageProps
  Component: React.ComponentType<PageProps & { entry: unknown }>
}

const Container = ({ pageProps, Component }: ContainerProps) => {
  const tinaData = pageProps.data.entry

  if (!isValidElementType(Component)) {
    throw new Error('Theme must export HOC.')
  }

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

export type NextPageProps = {
  pageProps: InternalPageProps
  Component: React.ComponentType<PageProps & { entry: unknown }>
}

const Page: NextPage<NextPageProps> = ({ pageProps, Component }) => {
  let component

  if (pageProps.context === 'internal') {
    const Admin = getComponent('Admin')
    if (Admin) {
      component = <Admin />
    }
  } else {
    component = <Container pageProps={pageProps} Component={Component} />
  }

  return <DynamicTinaProvider>{component}</DynamicTinaProvider>
}

export default Page
