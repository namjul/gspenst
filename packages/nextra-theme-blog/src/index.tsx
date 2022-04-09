// @ts-expect-error -- no type declarations available

import withLayout from 'nextra-theme-blog'
import type { PageProps, Root } from '@gspenst/next'
import getComponent from '@gspenst/next/componentRegistry'
import { useMDXComponents } from '@mdx-js/react'

const GspenstMdxTheme = getComponent('MdxTheme')

const MdxTheme = (
  props: React.ComponentProps<NonNullable<typeof GspenstMdxTheme>>
) => {
  const { wrapper: MDXLayout, ...components } = {
    ...useMDXComponents(),
    ...props.components,
  }

  if (GspenstMdxTheme) {
    // @ts-expect-error --- TODO solve type incompatibility between tinacms `Components` and `@mdx-js/react`'s `MDXComponents`
    const mdxTheme = (
      <GspenstMdxTheme components={components} content={props.content} />
    )
    return MDXLayout ? <MDXLayout {...props}>mdxTheme</MDXLayout> : mdxTheme
  }

  return null
}

type PageMapItem = {
  name: string
  route: string
  locale?: string
  children?: PageMapItem[]
  frontMatter?: Record<string, any>
  meta?: Record<string, any>
  active?: boolean
}
type Heading = {
  value: string
}
type PageOpt = {
  filename: string
  route: string
  meta: Record<string, any>
  pageMap: PageMapItem[]
  titleText: string | undefined
  headings?: Heading[]
  hasH1: boolean
}

type NextraBlogTheme = {
  readMore?: string
  footer?: React.ReactNode
  titleSuffix: string | undefined
  postFooter: string | undefined
  head?: ({
    title,
    meta,
  }: {
    title: string
    meta: Record<string, any>
  }) => React.ReactNode
  cusdis?: {
    appId: string
    host?: string
    lang: string
  }
  darkMode?: boolean
  navs?: {
    url: string
    name: string
  }[]
}

const defaultConfig = {
  readMore: 'Read More →',
  footer: (
    <small style={{ display: 'block', marginTop: '8rem' }}>
      CC BY-NC 4.0 2020 © Shu Ding.
    </small>
  ),
  titleSuffix: 'titleSuffix',
  postFooter: null,
}

export default (_config: NextraBlogTheme) => {
  const config: NextraBlogTheme = {
    ...defaultConfig,
    ..._config,
  }

  const Comp = (props: PageProps) => {
    // console.log('PageProps(theme)', props)

    let body

    const { context } = props

    switch (context) {
      case 'post':
        body = props.data.entry.data.getPostDocument.data.body as Root
        break
      case 'page':
        body = props.data.entry.data.getPageDocument.data.body as Root
        break
      default:
    }

    const pageOptions: PageOpt = {
      filename: 'empty',
      route: props.route,
      meta: {
        type: context,
      },
      pageMap: [],
      titleText: props.headers?.titleText || 'my title', // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
      headings: [],
      hasH1: false, // TODO props.data.headers?.hasH1 ?? false,
    }

    // if (props.context === 'page') {
    //   const data = props.data.entry?.data.getPageDocument.data ?? {}
    //   pageOptions.titleText = data.title ?? ''
    //   body = data.body
    // } else if (props.context === 'index') {
    //   const pageMap: PageMapItem[] = props.data.posts.map((post, index) => {
    //     return {
    //       name: 'posts' + index,
    //       route: '/something' + index,
    //       frontMatter: { type: 'post' },
    //     }
    //   })
    //   pageOptions.pageMap = pageMap
    //   pageOptions.meta.type = 'posts'
    // }

    // eslint-disable-next-line
    const NextraThemeBlog = withLayout(pageOptions, config)

    return (
      <NextraThemeBlog>
        <MdxTheme content={body} />
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </NextraThemeBlog>
    )
  }

  return Comp
}
