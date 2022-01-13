import { lightTheme, darkTheme } from '@gspenst/components'
import { ThemeProvider } from '@gspenst/next/components'
import type { NextPage } from 'next'
import type { PageProps } from '@gspenst/next'
import { get } from '@gspenst/utils'
import getComponent from './components-registry'

export type { ThemeOptions } from './types'

export const Page: NextPage<PageProps> = (pageProps) => {
  const layout = get(pageProps.entry, '__metadata.modelName')

  const PageLayout = getComponent(layout)

  if (!PageLayout) {
    throw new Error(`no page layout matching the layout: ${layout}`)
  }

  return (
    <ThemeProvider light={lightTheme} dark={darkTheme}>
      <PageLayout {...pageProps} />
    </ThemeProvider>
  )
}

export { getComponent }
