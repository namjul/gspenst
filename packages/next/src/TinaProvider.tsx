import TinaCMS, { defineConfig } from 'tinacms'
import { client } from '@gspenst/core'
import type { ClientConfig } from './types'

const TinaProvider = ({
  config,
  children,
}: React.PropsWithChildren<{
  config: ClientConfig
}>) => {
  const tinaConfig = defineConfig({
    client,
    schema: config.tinaSchema,
    cmsCallback: (cms) => {
      // enable tina admin
      cms.flags.set('tina-admin', true)

      // When `tina-admin` is enabled, this plugin configures contextual editing for collections
      import('tinacms').then(({ RouteMappingPlugin }) => {
        const RouteMapping = new RouteMappingPlugin((collection, document) => {
          return config.routingMapping[document._sys.path]
        })
        cms.plugins.add(RouteMapping)
      })

      return cms
    },
    formifyCallback: ({ formConfig, createForm, createGlobalForm }) => {
      if (formConfig.id === 'content/config/index.json') {
        return createGlobalForm(formConfig)
      }

      return createForm(formConfig)
    },
  })

  // @ts-expect-error -- actually I dont' expect an error but could not find the reason for it.
  return <TinaCMS {...tinaConfig}>{children}</TinaCMS>
}

export default TinaProvider
