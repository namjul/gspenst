// @ts-expect-error -- no type declarations available
import withLayout from 'nextra-theme-blog'
import type { Root } from 'gspenst'
import type { PageOpt } from 'nextra'
import { useStore, selectData, selectConfig } from 'gspenst/data'
import getComponent from '@gspenst/next/componentRegistry'
import { useMDXComponents } from '@mdx-js/react'
import { BlockQuote } from './components/testimonial'
import { Cta } from './components/cta'
import { defaultConfig } from './config'
import type { TinaConfig, NextraBlogTheme } from './config'

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
  const config: NextraBlogTheme = {
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

    const postsPageMap = postResources.flatMap((post) =>
      post.type === 'post'
        ? {
            name: post.title,
            route: post.path,
            frontMatter: {
              type: 'post',
              date: post.date,
              description: post.excerpt,
            },
          }
        : []
    )

    const indexPageMap = state.pageMap.flatMap((page) => {
      if (['collection', 'channel', 'custom'].includes(page.type)) {
        return {
          name: page.name,
          route: page.route,
          frontMatter: {
            type: 'posts',
          },
        }
      }
      return []
    })

    const pageOptions: PageOpt = {
      filename: 'empty',
      route,
      meta: {
        type: (() => {
          if (context?.includes('index')) {
            return 'posts'
          }
          return context?.at(0) ?? 'post'
        })(),
        ...(entryResource
          ? {
              author: entryResource.primary_author?.name ?? 'no author',
              tag: entryResource.primary_tag?.name ?? 'no author',
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
              name: page.name,
              route: page.route,
              frontMatter: { type: page.resourceType },
            }
          }
          return []
        }),
      ],
      titleText: entryResource?.title ?? entryResource?.slug ?? null,
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
            type: 'heading',
            children: heading.children, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            depth,
            value: heading.value,
          }
        }) ?? [],
      hasH1: entryResource?.hasH1 ?? false,
    }

    console.log(state, pageOptions)

    // eslint-disable-next-line
    const NextraThemeBlog = withLayout(
      pageOptions,
      config
    ) as React.ComponentType & {
      getLayout?: (page: React.ReactNode) => React.ReactNode
    }

    const getLayout =
      NextraThemeBlog.getLayout ?? ((page: React.ReactNode) => page)

    return getLayout(
      <>
        <NextraThemeBlog>
          {entryResource?.content ? (
            <MdxTheme content={entryResource.content} />
          ) : (
            ''
          )}
        </NextraThemeBlog>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </>
    )
  }

  return Page
}

export default createTheme
