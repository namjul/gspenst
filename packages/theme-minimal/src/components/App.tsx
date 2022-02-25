import dynamic from 'next/dynamic'
import { TinaEditProvider } from 'tinacms/dist/edit-state'
import type { AppProps as NextAppProps } from 'next/app'

type AppProps<P = {}> = { pageProps: P } & Omit<NextAppProps<P>, 'pageProps'>

const TinaCMS = dynamic(() => import('tinacms'), { ssr: false })

const branch = 'main'
const apiURL =
  process.env.NODE_ENV == 'development'
    ? 'http://localhost:4001/graphql'
    : `https://content.tinajs.io/content/${process.env.NEXT_PUBLIC_TINA_CLIENT_ID}/github/${branch}`

const App = ({ Component, pageProps }: AppProps<{ query: string }>) => {
  return (
    <TinaEditProvider
      showEditButton={true}
      editMode={
        <TinaCMS
          cmsCallback={(cms) => {
            // cms.flags.set('tina-admin', true)
            return cms
          }}
          apiURL={apiURL}
        >
          <Component {...pageProps} />
        </TinaCMS>
      }
    >
      <Component {...pageProps} />
    </TinaEditProvider>
  )
}

export default App
