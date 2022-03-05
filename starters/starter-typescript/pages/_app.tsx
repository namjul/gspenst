import type { AppProps } from 'next/app'
import { Provider } from '@gspenst/theme-minimal'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  )
}

export default App
