import sourcebit from 'sourcebit'
// import remarkGfm from 'remark-gfm'

import type { NextConfig } from 'next'
// import type { Configuration } from 'webpack'
import type { SourcebitConfig, SourcebitPlugin } from 'sourcebit'
import type { Options /* RemarkPlugin */ } from './types'
import * as sourcebitTargetNext from './sourcebit/targetNext'
import * as sourcebitSourceTheme from './sourcebit/sourceTheme'

// const defaultExtensions = ['js', 'jsx', 'ts', 'tsx']
// const markdownExtensions = ['md', 'mdx']
// const markdownExtensionTest = /\.mdx?$/

export default (...args: Array<string | Options>) =>
  (nextConfig: NextConfig = {}): NextConfig => {
    const options =
      typeof args[0] === 'string'
        ? {
            theme: args[0],
            themeConfig: args[1] as string,
          }
        : args[0]

    // const pageExtensions = nextConfig.pageExtensions ?? [
    //   ...defaultExtensions,
    //   ...markdownExtensions,
    // ]

    const pluginSuffix = '@gspenst/sourcebit'
    const sourcePlugins: SourcebitPlugin[] = (options.plugins ?? []).map(
      (plugin) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        module: require(`${pluginSuffix}-${plugin.resolve.replace(
          `${pluginSuffix}-`,
          ''
        )}`), // eslint - disable - line @typescript-eslint / no - unsafe - assignment
        options: plugin.options,
      })
    )

    const sourcebitConfig: SourcebitConfig = {
      plugins: [
        ...sourcePlugins,
        {
          module: sourcebitSourceTheme,
          options,
        },
        {
          module: sourcebitTargetNext,
        },
      ],
    }

    sourcebit.fetch(sourcebitConfig)

    return {
      ...nextConfig,
      // pageExtensions,
      // webpack(config: Configuration, context) {
      //   config.module?.rules?.push({
      //     test: markdownExtensionTest,
      //     use: [
      //       context.defaultLoaders.babel,
      //       {
      //         loader: '@mdx-js/loader',
      //         options: {
      //           ...options.mdxOptions,
      //           remarkPlugins: (options.mdxOptions?.remarkPlugins ?? []).concat(
      //             [remarkGfm as RemarkPlugin]
      //           ),
      //         },
      //       },
      //       {
      //         loader: '@gspenst/next/loader',
      //         options: { ...options },
      //       },
      //     ],
      //   })
      //
      //   if (typeof nextConfig.webpack === 'function') {
      //     return nextConfig.webpack(config, context)
      //   }
      //
      //   return config
      // },
      reactStrictMode: true,
      experimental: {
        // Prefer loading of ES Modules over CommonJS
        esmExternals: true,
        // externalDir: true,
      },
    }
  }
