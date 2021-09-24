/**
 * For information about this file see https://nextjs.org/docs/advanced-features/custom-app
 */

import * as React from 'react'
import type { AppProps } from 'next/app'

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default App
