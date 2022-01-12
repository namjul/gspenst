import * as React from 'react'
import { lightTheme, darkTheme } from '@gspenst/components'
import { ThemeProvider } from '@gspenst/next/components'
import type { NextPage } from 'next'
import type { Entry } from '@gspenst/next'
import { get } from '@gspenst/utils'
import getComponent from './components-registry'

export const Page: NextPage<Entry> = (entry) => {
  const { children } = entry

  const layout = get(entry, '__metadata.modelName')

  const PageLayout = getComponent(layout)

  // if (!PageLayout) {
  //   throw new Error(`no page layout matching the layout: ${layout}`)
  // }

  return (
    <ThemeProvider light={lightTheme} dark={darkTheme}>
      <PageLayout>
        <pre>{JSON.stringify(entry, null, 2)}</pre>
        {children}
      </PageLayout>
    </ThemeProvider>
  )
}

export { getComponent }
