import sourcebit from 'sourcebit'
import * as sourcebitTargetNext from 'sourcebit-target-next'
import remarkGfm from 'remark-gfm'

import type { NextConfig } from 'next'
import type { Configuration } from 'webpack'
import type { SourcebitConfig, SourcebitPlugin } from 'sourcebit'
import type { SourcebitNextOptions, Props } from 'sourcebit-target-next'
import type { Options, Config, RemarkPlugin, Post, Setting } from './types'

export type PageProps = Props & { setting: Setting; posts: Post[] }

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

    const sourcePlugins = (options.plugins ?? []).map((plugin) => ({
      module: require(plugin.resolve), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      options: plugin.options,
    }))

    const targetPlugin: SourcebitPlugin<SourcebitNextOptions> = {
      module: sourcebitTargetNext,
      options: {
        pages: [
          {
            path: '/posts/{id}',
            predicate: (object) => {
              if (object.__metadata.modelName === 'post') {
                return true
              }
              return false
            },
          },
        ],
        commonProps: {
          posts: {
            predicate: (object) => {
              if (object.__metadata.modelName === 'post') {
                return true
              }
              return false
            },
          },
          settings: {
            single: true,
            predicate: (object) => {
              if (object.__metadata.modelName === 'setting') {
                return true
              }
              return false
            },
          },
        },
        liveUpdate: false,
      },
    }

    const sourcebitConfig: SourcebitConfig = {
      plugins: [...sourcePlugins, targetPlugin],
    }

    sourcebit.fetch(sourcebitConfig)

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
