import dynamic from 'next/dynamic'
import { TinaEditProvider } from 'tinacms/dist/edit-state'

const TinaCMS = dynamic(() => import('tinacms'), { ssr: false })

const branch = 'main'
const apiURL =
  process.env.NODE_ENV == 'development'
    ? 'http://localhost:4001/graphql'
    : `https://content.tinajs.io/content/${process.env.NEXT_PUBLIC_TINA_CLIENT_ID}/github/${branch}`

const Provider = ({ children }: React.PropsWithChildren<{}>) => (
  <TinaCMS
    apiURL={apiURL}
    cmsCallback={(cms) => {
      cms.flags.set('tina-admin', true)
      return cms
    }}
    formifyCallback={({ formConfig, createForm, createGlobalForm }) => {
      if (formConfig.id === 'getConfigDocument') {
        return createGlobalForm(formConfig)
      }

      return createForm(formConfig)
    }}
  >
    {children}
  </TinaCMS>
)

const TinaProvider = ({ children }: React.PropsWithChildren<{}>) => (
  <TinaEditProvider editMode={<Provider>{children}</Provider>}>
    {children}
  </TinaEditProvider>
)

export default TinaProvider
