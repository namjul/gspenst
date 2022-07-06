// @ts-expect-error -- no type declarations available

import withLayout from 'nextra-theme-blog'
import type { PageThemeContext, Root } from 'gspenst'
import { useData } from 'gspenst/data'
import getComponent from '@gspenst/next/componentRegistry'
import { useMDXComponents } from '@mdx-js/react'
import { BlockQuote } from './components/testimonial'
import { Cta } from './components/cta'
import { defaultConfig } from './config'
import type { NextraBlogTheme } from './config'

const GspenstMdxTheme = getComponent('MdxTheme')

const componentsx = {
  BlockQuote,
  Cta,
}

const MdxTheme = (props: { content: Root | undefined }) => {
  const { wrapper: MDXLayout, ...components } = {
    ...useMDXComponents(),
    ...componentsx,
  }

  if (GspenstMdxTheme) {
    const mdxTheme = (
      // @ts-expect-error --- TODO solve type incompatibility between tinacms `Components` and `@mdx-js/react`'s `MDXComponents`
      <GspenstMdxTheme components={components} content={props.content} />
    )
    return MDXLayout ? <MDXLayout>mdxTheme</MDXLayout> : mdxTheme
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
  meta: {
    author: string
    date: string
    tag: string
    type: string
    [key: string]: any
  }
  pageMap: PageMapItem[]
  titleText: string | undefined
  headings?: Heading[]
  hasH1: boolean
}

const createTheme = (_config: NextraBlogTheme) => {
  const config: NextraBlogTheme = {
    ...defaultConfig,
    ..._config,
  }

  const Page = (props: PageThemeContext) => {
    const { context } = props
    const { resources } = useData()
    const resource = resources[0]

    if (!resource) {
      throw new Error('Resource missing')
    }

    let author, tag, date, content

    const { type } = resource

    switch (type) {
      case 'post':
      case 'page': {
        author = resource.primary_author
        tag = resource.primary_tag
        date = resource.date
        content = resource.content as Root
        break
      }
      default:
    }

    const pageOptions: PageOpt = {
      filename: 'empty',
      route: resource.path,
      meta: {
        type: context?.at(0) ?? 'post',
        author: author?.name ?? 'no author',
        tag: tag?.name ?? 'no tag',
        date: date ?? 'no date',
      },
      pageMap: [],
      titleText: /*props.headers?.titleText || */ 'my title', // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
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
    // })
    //   pageOptions.pageMap = pageMap
    //   pageOptions.meta.type = 'posts'
    // }

    // eslint-disable-next-line
    const NextraThemeBlog = withLayout(pageOptions, config)

    return (
      <NextraThemeBlog>
        <MdxTheme content={content} />
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </NextraThemeBlog>
    )
  }

  return Page
}

export default createTheme
