import type * as React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import type { FallbackProps } from 'react-error-boundary'
import { useTina } from 'tinacms/dist/edit-state'
import type { NextPage } from 'next'
import { isValidElementType } from 'react-is'
import DynamicTinaProvider from './TinaDynamicProvider'
import getComponent from './componentRegistry'
// import getHeaders from './helpers/getHeaders'
import type { PageProps } from './types'
import type { PageProps as InternalPageProps } from './controller'
import type { ClientConfig } from './shared/client'

export { createSchema } from './schema'

type ThemeComponent = React.ComponentType<PageProps>

export type ContainerProps = {
  pageProps: Exclude<InternalPageProps, { context: 'internal' }> & {}
  Component: ThemeComponent
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

const Container = ({ pageProps, Component }: ContainerProps) => {
  const { resource } = pageProps
  const { tinaData } = resource

  if (!isValidElementType(Component)) {
    throw new Error('Theme must export HOC.')
  }

  const { data, isLoading } = useTina({
    query: tinaData.query,
    variables: tinaData.variables,
    data: tinaData.data,
  })

  const _pageProps = {
    ...pageProps,
    resource: { ...resource, tinaData: { ...resource.tinaData, data } },
  } as ContainerProps['pageProps']

  console.log('pageProps: ', _pageProps)
  console.log('client#isLoading: ', isLoading)

  // overwrite with dynamic value from tina
  // pageProps.data.entry.data = data

  // const headers = (() => {
  //   const entryData = pageProps.data.entry.data
  //   if ('getPostDocument' in entryData) {
  //     return getHeaders(entryData.getPostDocument.data.body as Root)
  //   }
  //   if ('getPageDocument' in entryData) {
  //     return getHeaders(entryData.getPageDocument.data.body as Root)
  //   }
  // })() // Immediately-invoked Function Expression

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Component {..._pageProps} />
    </ErrorBoundary>
  )
}

export type NextPageProps = {
  pageProps: InternalPageProps
  Component: ThemeComponent
  config: ClientConfig
}

const Page: NextPage<NextPageProps> = ({ pageProps, Component, config }) => {
  console.log('config', config)
  // console.log('PageProps(next): ', pageProps)
  let component

  if (pageProps.context === 'internal') {
    const Admin = getComponent('Admin')
    if (Admin) {
      component = <Admin />
    }
  } else {
    component = <Container pageProps={pageProps} Component={Component} />
  }

  return <DynamicTinaProvider config={config}>{component}</DynamicTinaProvider>
}

export default Page
