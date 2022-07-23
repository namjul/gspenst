import { useState, useEffect } from 'react'
import TinaCMS, { defineConfig } from 'tinacms'
import type { TinaCloudSchema } from 'tinacms'
import { client } from '../shared/client'
import { configStringId } from '../constants'
import type { RoutingMapping } from '../helpers/getPageMap'

export type TinaProviderProps = React.PropsWithChildren<{
  getTinaSchema: () => Promise<TinaCloudSchema>
  routingMapping: RoutingMapping
}>

const TinaProvider = ({
  getTinaSchema,
  routingMapping,
  children,
}: TinaProviderProps) => {
  const [tinaSchema, setTinaSchema] = useState<TinaCloudSchema>()

  useEffect(() => {
    const get = async () => {
      setTinaSchema(await getTinaSchema())
    }
    void get()
  }, [getTinaSchema])

  if (!tinaSchema) {
    return null
  }

  const tinaConfig = defineConfig({
    client,
    schema: tinaSchema,
    cmsCallback: (cms) => {
      // enable tina admin
      cms.flags.set('tina-admin', true)

      // When `tina-admin` is enabled, this plugin configures contextual editing for collections
      void import('tinacms').then(({ RouteMappingPlugin }) => {
        const RouteMapping = new RouteMappingPlugin((_collection, document) => {
          return routingMapping[document._sys.path]
        })
        cms.plugins.add(RouteMapping)
      })

      return cms
    },
    formifyCallback: ({ formConfig, createForm, createGlobalForm }) => {
      if (formConfig.id === configStringId) {
        return createGlobalForm(formConfig)
      }

      return createForm(formConfig)
    },
  })

  // @ts-expect-error -- actually I dont' expect an error but could not find the reason for it.
  return <TinaCMS {...tinaConfig}>{children}</TinaCMS>
}

export default TinaProvider
