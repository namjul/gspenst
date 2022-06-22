import TinaCMS, { defineConfig } from 'tinacms'
import type { TinaCloudSchema } from 'tinacms'
import { client } from './shared/client'

const TinaProvider = ({
  tinaSchema,
  children,
}: React.PropsWithChildren<{
  tinaSchema: TinaCloudSchema
}>) => {
  const tinaConfig = defineConfig({
    client,
    schema: tinaSchema,
    cmsCallback: (cms) => {
      // enable tina admin
      cms.flags.set('tina-admin', true)

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
