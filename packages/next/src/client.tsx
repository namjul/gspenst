import type * as React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import type { FallbackProps } from 'react-error-boundary'
import type { TinaCloudSchema } from 'tinacms'
import { defineConfig } from 'tinacms'
import { useTina } from 'tinacms/dist/edit-state'
import type { NextPage } from 'next'
import { isValidElementType } from 'react-is'
import { client } from './shared/client'
import DynamicTinaProvider from './TinaDynamicProvider'
import getComponent from './componentRegistry'
// import getHeaders from './getHeaders'
import type { PageProps } from './types'
import type { PageProps as InternalPageProps } from './controller'

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

  const tinaConfig = defineConfig({
    client,
    schema: tinaSchema,
    cmsCallback: (cms) => {
      cms.flags.set('tina-admin', true)
      return cms
    },
    formifyCallback: ({ formConfig, createForm, createGlobalForm }) => {
      console.log('formConfig: ', formConfig)
      if (formConfig.id === 'content/config/index.json') {
        return createGlobalForm(formConfig)
      }

      return createForm(formConfig)
    },
  })

  return (
    <DynamicTinaProvider tinaConfig={tinaConfig}>
      {component}
    </DynamicTinaProvider>
  )
}

export default Page
