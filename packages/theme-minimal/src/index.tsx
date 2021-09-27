import Head from 'next/head'
import { Box, lightTheme, darkTheme } from '@gspenst/components'
import { ThemeProvider, ThemeSwitch } from '@gspenst/next/components'
import type { ReactNode } from 'react'
import type { NextPage } from 'next'
import type { Config } from '@gspenst/next'

export type ThemeOptions = {
  darkMode?: boolean
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
    <>
      <Head>
        <title>title placeholder</title>
        {options.head}
      </Head>
      <Box as="article" css={{ color: '$gray11', backgroundColor: '$gray2' }}>
        {children}
        {options.darkMode && <ThemeSwitch />}
        {options.footer}
      </Box>
    </>
  )
}

const defaultOptions = {}

export default (config: Config, opts: ThemeOptions) => {
  const options = { ...defaultOptions, ...opts }

  const Page: NextPage = (props) => {
    return (
      <ThemeProvider light={lightTheme} dark={darkTheme}>
        <Layout options={options} {...config} {...props} />
      </ThemeProvider>
    )
  }

  return Page
}
