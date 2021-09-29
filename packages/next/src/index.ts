import type { NextConfig } from 'next'
import type { Configuration } from 'webpack'
import type { Options as MDXOptions } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'

export type Config = {
  filename: string
  route: string
  meta: string
  pageMap: string
}

type Unpacked<T> = T extends Array<infer U> ? U : T
type Options = { theme: string; themeConfig: string; mdxOptions?: MDXOptions }
type RemarkPlugin = Unpacked<Exclude<MDXOptions['remarkPlugins'], undefined>>

const defaultExtensions = ['js', 'jsx', 'ts', 'tsx']
const markdownExtensions = ['md', 'mdx']
const markdownExtensionTest = /\.mdx?$/

export default (...args: Array<string | Options>) =>
  (nextConfig: NextConfig = {}): NextConfig => {
    const pkgConfig =
      typeof args[0] === 'string'
        ? {
            theme: args[0],
            themeConfig: args[1] as string,
          }
        : args[0]

    const pageExtensions = nextConfig.pageExtensions ?? [
      ...defaultExtensions,
      ...markdownExtensions,
    ]

    return {
      ...nextConfig,
      pageExtensions,
      webpack(config: Configuration, context) {
        config.module?.rules?.push({
          test: markdownExtensionTest,
          use: [
            context.defaultLoaders.babel,
            {
              loader: '@mdx-js/loader',
              options: {
                ...pkgConfig.mdxOptions,
                remarkPlugins: (
                  pkgConfig.mdxOptions?.remarkPlugins ?? []
                ).concat([remarkGfm as RemarkPlugin]),
              },
            },
            {
              loader: '@gspenst/next/loader',
              options: { ...pkgConfig },
            },
          ],
        })

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, context)
        }

        return config
      },
    }
  }
