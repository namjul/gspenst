import withPreconstruct from '@preconstruct/next'
import sourcebit from 'sourcebit'
// import remarkGfm from 'remark-gfm'

import type { NextConfig } from 'next'
// import type { Configuration } from 'webpack'
import type { SourcebitConfig } from 'sourcebit'
import * as sourcebitSourceTina from '@gspenst/source-tina'
import * as sourcebitTargetNext from './sourcebit/targetNext'

// const defaultExtensions = ['js', 'jsx', 'ts', 'tsx']
// const markdownExtensions = ['md', 'mdx']
// const markdownExtensionTest = /\.mdx?$/

export default () =>
  (nextConfig: NextConfig = {}): NextConfig => {
    // const pageExtensions = nextConfig.pageExtensions ?? [
    //   ...defaultExtensions,
    //   ...markdownExtensions,
    // ]

    const sourcebitConfig: SourcebitConfig = {
      plugins: [
        {
          module: sourcebitSourceTina,
        },
        {
          module: sourcebitTargetNext,
        },
      ],
    }

    sourcebit.fetch(sourcebitConfig)

    return withPreconstruct({
      // eslint-disable-line @typescript-eslint/no-unsafe-call
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
    })
  }
