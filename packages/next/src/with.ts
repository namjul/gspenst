import withPreconstruct from '@preconstruct/next'
import type { NextConfig } from 'next'
import type { Options } from './types'
import { startTinaServer } from './server'
// import remarkGfm from 'remark-gfm'

// const defaultExtensions = ['js', 'jsx', 'ts', 'tsx']
// const markdownExtensions = ['md', 'mdx']
// const markdownExtensionTest = /\.mdx?$/

export default (...args: [string | Options]) =>
  (nextConfig: NextConfig = {}): NextConfig => {
    const options = typeof args[0] === 'string' ? { theme: args[0] } : args[0]
    // const pageExtensions = nextConfig.pageExtensions ?? [
    //   ...defaultExtensions,
    //   ...markdownExtensions,
    // ]

    // // Since Next.js doesn't provide some kind of real "plugin system" we're (ab)using the `redirects` option here
    // // in order to hook into and block the `next build` and initial `next dev` run.
    // redirects: async () => {
    //   if (isBuild) {
    //     await runContentlayerBuild()
    //   } else if (isNextDev && !devServerStarted) {
    //     devServerStarted = true
    //     // TODO also block here until first Contentlayer run is complete
    //     runContentlayerDev()
    //   }
    //
    //   return nextConfig.redirects?.() ?? []
    // },
    // webpack(config: any, options: any) {
    //   config.watchOptions = {
    //     ...config.watchOptions,
    //     // ignored: /node_modules([\\]+|\/)+(?!\.contentlayer)/,
    //     ignored: ['**/node_modules/!(.contentlayer)/**/*'],
    //   }
    //
    //   if (typeof nextConfig.webpack === 'function') {
    //     return nextConfig.webpack(config, options)
    //   }
    //
    //   return config
    // },

    return withPreconstruct({
      // eslint-disable-line @typescript-eslint/no-unsafe-call
      ...nextConfig,
      // pageExtensions,
      redirects: async () => {
        await startTinaServer(options)
        return nextConfig.redirects?.() ?? []
      },
      // webpack(config: Configuration, context) {
      //   // config.module?.rules?.push({
      //   //   test: markdownExtensionTest,
      //   //   use: [
      //   //     context.defaultLoaders.babel,
      //   //     {
      //   //       loader: '@mdx-js/loader',
      //   //       options: {
      //   //         ...options.mdxOptions,
      //   //         remarkPlugins: (options.mdxOptions?.remarkPlugins ?? []).concat(
      //   //           [remarkGfm as RemarkPlugin]
      //   //         ),
      //   //       },
      //   //     },
      //   //     {
      //   //       loader: '@gspenst/next/loader',
      //   //       options: { ...options },
      //   //     },
      //   //   ],
      //   // })
      //
      //   if (typeof nextConfig.webpack === 'function') {
      //     return nextConfig.webpack(config, context)
      //   }
      //
      //   return config
      // },
      reactStrictMode: true,
      // experimental: {
      //   // Prefer loading of ES Modules over CommonJS
      //   esmExternals: 'loose',
      //   externalDir: true,
      // },
    })
  }
