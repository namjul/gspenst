import type * as React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import type { FallbackProps } from 'react-error-boundary'
import { useTina } from 'tinacms/dist/edit-state'
import type { NextPage } from 'next'
import { isValidElementType } from 'react-is'
import DynamicTinaProvider from './TinaDynamicProvider'
import getComponent from './componentRegistry'
import type { PageProps } from './types'
import type { PageProps as InternalPageProps } from './controller'

type ThemeComponent = React.ComponentType<PageProps & { loading: boolean }>

export type ContainerProps = {
  pageProps: PageProps
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
  const tinaData = pageProps.data.entry

  if (!isValidElementType(Component)) {
    throw new Error('Theme must export HOC.')
  }

  const { data, isLoading } = useTina({
    query: tinaData.query,
    variables: tinaData.variables,
    data: tinaData.data,
  })

  // overwrite with dynamic value from tina
  pageProps.data.entry.data = data

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Component {...pageProps} loading={isLoading} />
    </ErrorBoundary>
  )
}

export type NextPageProps = {
  pageProps: InternalPageProps
  Component: ThemeComponent
}

const Page: NextPage<NextPageProps> = ({ pageProps, Component }) => {
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

  return <DynamicTinaProvider>{component}</DynamicTinaProvider>
}

export default Page
