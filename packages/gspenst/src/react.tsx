import type * as React from 'react'
import { TinaEditProvider, useTina } from 'tinacms/dist/edit-state'
import type { TinaCloudSchema } from 'tinacms'
import { isValidElementType } from 'react-is'
import type { ThemeContext } from './domain/theming'
// import getHeaders from './helpers/getHeaders'
import { createRoutingMapping } from './domain/resource'

export type ThemeComponentProps = Exclude<ThemeContext, { context: 'internal' }>
type ThemeComponent = React.ComponentType<ThemeComponentProps>

export type ContainerProps = {
  pageProps: ThemeComponentProps
  Component: ThemeComponent
}

const Container = ({ pageProps, Component }: ContainerProps) => {
  const { resource } = pageProps
  const { tinaData } = resource

  if (!isValidElementType(Component)) {
    throw new Error('Theme must export HOC.')
  }

  const { data /*, isLoading*/ } = useTina({
    query: tinaData.query,
    variables: tinaData.variables,
    data: tinaData.data,
  })

  const _pageProps = {
    ...pageProps,
    resource: { ...resource, tinaData: { ...resource.tinaData, data } },
  } as ContainerProps['pageProps']

  // console.log('pageProps: ', _pageProps)
  // console.log('client#isLoading: ', isLoading)

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

  return <Component {..._pageProps} />
}

export type PageProps = {
  pageProps: ThemeContext
  Component: ThemeComponent
  // Inspiration:
  // https://docs.stackbit.com/how-to-guides/components/add-component/#register_the_component
  // https://github.com/stackbit-themes/starter-nextjs-theme/blob/main/src/components/components-registry.ts
  // https://nextjs.org/docs/advanced-features/dynamic-import
  getComponent: (
    name: 'Admin' | 'TinaProvider'
  ) => React.ComponentType<any> | undefined
  config: {
    tinaSchema: TinaCloudSchema
    routingMapping: ReturnType<typeof createRoutingMapping>
  }
}

const Page = ({ pageProps, getComponent, Component, config }: PageProps) => {
  // console.log('config', config)
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

  const TinaProvider = getComponent('TinaProvider')

  if (!TinaProvider) {
    throw new Error('Missing TinaProvider')
  }

  return (
    <TinaEditProvider
      editMode={<TinaProvider config={config}>{component}</TinaProvider>}
    >
      {component}
    </TinaEditProvider>
  )
}

export default Page
