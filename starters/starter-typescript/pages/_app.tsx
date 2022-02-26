import type { AppProps } from 'next/app'
import { TinaProvider } from '@gspenst/theme-minimal'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <TinaProvider>
      <Component {...pageProps} />
    </TinaProvider>
  )
}

export default App
