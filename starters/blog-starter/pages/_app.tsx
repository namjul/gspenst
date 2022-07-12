import type { AppProps } from 'next/app'
import '@gspenst/nextra-theme-blog/style.css'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
