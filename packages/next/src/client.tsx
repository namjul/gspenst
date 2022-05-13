import type * as React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import type { FallbackProps } from 'react-error-boundary'
import type { TinaCloudSchema } from 'tinacms'
// import { useTina } from 'tinacms/dist/edit-state'
import type { NextPage } from 'next'
import { isValidElementType } from 'react-is'
import { createConfig } from './schema'
import DynamicTinaProvider from './TinaDynamicProvider'
import getComponent from './componentRegistry'
// import getHeaders from './getHeaders'
import type { PageProps } from './types'
import type { /*Root,*/ Simplify } from './shared-kernel'
import type { PageProps as InternalPageProps } from './controller'

export { createSchema } from './schema'

type ThemeComponent = React.ComponentType<PageProps>

export type ContainerProps = {
  pageProps: Simplify<Exclude<InternalPageProps, { context: 'internal' }> & {}>
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
  // const tinaData = pageProps.data.entry

  if (!isValidElementType(Component)) {
    throw new Error('Theme must export HOC.')
  }

  // const { data, isLoading } = useTina({
  //   query: tinaData.query,
  //   variables: tinaData.variables,
  //   data: tinaData.data,
  // })

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
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}

export type NextPageProps = {
  pageProps: InternalPageProps
  Component: ThemeComponent
  tinaSchema: TinaCloudSchema
}

const Page: NextPage<NextPageProps> = ({
  pageProps,
  Component,
  tinaSchema,
}) => {
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

  const tinaConfig = createConfig(tinaSchema)

  return (
    <DynamicTinaProvider tinaConfig={tinaConfig}>
      {component}
    </DynamicTinaProvider>
  )
}

export default Page
