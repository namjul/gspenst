import sourcebit from 'sourcebit'
import remarkGfm from 'remark-gfm'
// import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'

import type { NextConfig } from 'next'
import type { Configuration } from 'webpack'
import type { SourcebitConfig, SourcebitPlugin } from 'sourcebit'
import type { SourcebitNextOptions } from 'sourcebit-target-next'
import type { Options, Config, RemarkPlugin } from './types'

export type { Options, Config }

const defaultExtensions = ['js', 'jsx', 'ts', 'tsx']
const markdownExtensions = ['md', 'mdx']
const markdownExtensionTest = /\.mdx?$/

export default (...args: Array<string | Options>) =>
  (nextConfig: NextConfig = {}) =>
  (
    phase: string,
    { defaultConfig }: { defaultConfig: NextConfig }
  ): NextConfig => {
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

    // type SampleObject = {
    //   userId: string
    //   id: string
    //   title: string
    //   body: string
    // }

    const sampleSourcePlugin: SourcebitPlugin = {
      module: require('sourcebit-sample-plugin'),
      options: {
        titleCase: false,
        // watch: phase == PHASE_DEVELOPMENT_SERVER,
      },
    }
    const targetPlugin: SourcebitPlugin<SourcebitNextOptions> = {
      module: require('sourcebit-target-next'),
      options: {
        pages: [
          {
            path: '/posts/{id}',
            predicate: (object) => {
              if (object.__metadata.modelName === 'sample-data') {
                return true
              }
              return false
            },
          },
          {
            path: '/posts',
            predicate: (object) => {
              if (object.id === 97) {
                console.log('FOUND 97', object)
                return true
              }
              return false
            },
          },
          {
            path: '/',
            predicate: (object) => {
              if (object.id === 97) {
                console.log('FOUND 97', object)
                return true
              }
              return false
            },
          },
        ],
      },
    }

    const sourcebitConfig: SourcebitConfig = {
      plugins: [sampleSourcePlugin, targetPlugin],
    }

    sourcebit.fetch(sourcebitConfig)

    return {
      ...defaultConfig,
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
