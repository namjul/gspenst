import '@gspenst/nextra-theme-blog/style.css'
import type { AppProps } from 'next/app'

const App = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />
}

export default App
