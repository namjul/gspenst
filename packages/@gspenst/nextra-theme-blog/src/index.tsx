import withLayout from 'nextra-theme-blog'
import { type Root } from 'gspenst'
import { type PageOpts, type PageMapItem } from 'nextra'
import { useStore, selectData, selectConfig } from 'gspenst/data'
import getComponent from '@gspenst/next/componentRegistry'
import { useMDXComponents } from '@mdx-js/react'
import { BlockQuote } from './components/testimonial'
import { Cta } from './components/cta'
import { type TinaConfig, type NextraBlogTheme, defaultConfig } from './config'

const GspenstMdxTheme = getComponent('MdxTheme')

const MdxTheme = (props: { content: Root | undefined }) => {
  const { wrapper: MDXLayout, ...components } = {
    ...useMDXComponents(),
    BlockQuote,
    Cta,
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

const createTheme = (_config: NextraBlogTheme) => {
  const themeConfig: NextraBlogTheme = {
    ...defaultConfig,
    ..._config,
  }

  const Page = () => {
    const { state } = useStore()
    const { context, route } = state

    const { resources } = selectData(state)
    const { resources: postResources } = selectData(state, 'posts')
    const ignoredtinaConfig = selectConfig<TinaConfig>(state)
    const resource = resources[0]

    if (!resource) {
      throw new Error('Resource missing')
    }

    const entryResource = (() => {
      const { type } = resource
      switch (type) {
        case 'post':
        case 'page': {
          return resource
        }
        default:
          return undefined
      }
    })()

    const postsPageMap: PageMapItem[] = postResources.flatMap((post) =>
      post.type === 'post'
        ? {
            kind: 'MdxPage',
            name: post.title || post.slug || 'Untitled', // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
            route: post.path,
            frontMatter: {
              type: 'post',
              date: post.date,
              description: post.excerpt,
              title: post.title,
            },
          }
        : []
    )

    const indexPageMap: PageMapItem[] = state.pageMap.flatMap((page) => {
      if (['collection', 'channel', 'custom'].includes(page.type)) {
        return {
          kind: 'MdxPage',
          name: page.name,
          route: page.route,
          frontMatter: {
            type: 'posts',
          },
        }
      }
      return []
    })

    const hasH1 = !!entryResource?.hasH1

    const pageOpts: PageOpts = {
      filePath: 'empty',
      route,
      frontMatter: {
        type: (() => {
          if (context?.includes('index')) {
            return 'posts'
          }
          return context?.at(0) ?? 'post'
        })(),
        ...(entryResource
          ? {
              title: entryResource.title,
              author: entryResource.primary_author?.name ?? 'no author',
              tag: entryResource.primary_tag?.name ?? 'no tag',
              date: entryResource.date,
            }
          : {}),
      },
      pageMap: [
        ...indexPageMap,
        ...postsPageMap,
        ...state.pageMap.flatMap((page) => {
          if (page.resourceType === 'page') {
            return {
              kind: 'MdxPage' as const,
              name: page.name,
              route: page.route,
              frontMatter: { type: page.resourceType },
            }
          }
          return []
        }),
      ],
      title: entryResource?.title ?? '',
      headings:
        entryResource?.headings.map((heading) => {
          const depth = (() => {
            const { type } = heading
            switch (type) {
              case 'h1':
                return 1
              case 'h2':
                return 2
              case 'h3':
                return 3
              case 'h4':
                return 4
              case 'h5':
                return 5
              case 'h6':
                return 6
              default:
                return 1
            }
          })()
          return {
            depth,
            value: heading.value,
            id: '',
          }
        }) ?? [],
      hasJsxInH1: hasH1,
    }

    const children = entryResource?.content ? (
      <MdxTheme content={entryResource.content} />
    ) : (
      ''
    )
    const nextraThemeBlog = withLayout({
      pageOpts,
      themeConfig,
      children,
      pageProps: {},
    })

    return (
      <>
        {nextraThemeBlog}
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </>
    )
  }

  return Page
}

export default createTheme
