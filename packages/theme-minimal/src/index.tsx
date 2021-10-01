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

  type Page = {
    [field: string]: string | number
  }

  const Page: NextPage<{ page: Page; posts: Array<Page> }> = (props) => {
    const { page, posts } = props
    return (
      <ThemeProvider light={lightTheme} dark={darkTheme}>
        <Layout options={options} {...config} {...props}>
          <h1>{page.title}</h1>
          <h2>{page.id}</h2>
          <section>{page.body}</section>
          {posts.map((post, index) => (
            <div key={index}>{post.title}</div>
          ))}
        </Layout>
      </ThemeProvider>
    )
  }

  return Page
}
