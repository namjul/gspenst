import type { NextConfig } from 'next'
import type { Configuration } from 'webpack'
import remarkGfm from 'remark-gfm'
import type { Options, Config, RemarkPlugin } from './types'

export type { Options, Config }

const defaultExtensions = ['js', 'jsx', 'ts', 'tsx']
const markdownExtensions = ['md', 'mdx']
const markdownExtensionTest = /\.mdx?$/

export default (...args: Array<string | Options>) =>
  (nextConfig: NextConfig = {}): NextConfig => {
    const options =
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
                ...options.mdxOptions,
                remarkPlugins: (options.mdxOptions?.remarkPlugins ?? []).concat(
                  [remarkGfm as RemarkPlugin]
                ),
              },
            },
            {
              loader: '@gspenst/next/loader',
              options: { ...options },
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
