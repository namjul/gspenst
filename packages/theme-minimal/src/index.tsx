import * as React from 'react'
import Head from 'next/head'
import type { ReactNode } from 'react'
import type { NextPage } from 'next'
import type { ThemeConfig } from '@gspenst/next'
import { Box } from '@gspenst/components'

export type ThemeOptions = {
  head?: JSX.Element
  footer?: JSX.Element
}

const Layout = ({
  options,
  children,
}: {
  options: ThemeOptions
  children?: ReactNode | undefined
}) => {
  return (
    <React.Fragment>
      <Head>
        <title>title placeholder</title>
        {options.head}
      </Head>
      <Box as="article" css={{ color: 'red' }}>
        {children}
        {options.footer}
      </Box>
    </React.Fragment>
  )
}

const defaultOptions = {}

export default (config: ThemeConfig, opts: ThemeOptions) => {
  const options = { ...defaultOptions, ...opts }

  const Page: NextPage = (props) => {
    return <Layout options={options} {...config} {...props} />
  }

  return Page
}
