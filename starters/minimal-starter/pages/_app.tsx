import type { AppProps } from 'next/app'
import '@gspenst/nextra-theme-blog/style.css'

// function MyApp({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />
// }

function MyApp({ Component, pageProps }: AppProps) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page)

  return getLayout(<Component {...pageProps} />)
}

export default MyApp
