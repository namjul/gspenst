import withPreconstruct from '@preconstruct/next'
import type { Configuration } from 'webpack'
import type { NextConfig } from 'next'
import { log } from './logger'
import type { LoaderOptions } from './loader'
import { GspenstPlugin } from './plugin'
import { staticExport } from './env'

const defaultExtensions = ['js', 'jsx', 'ts', 'tsx']
const yamlExtensions = ['yml', 'yaml']
// const yamlExtensionTest = /\.(yml|yaml)$/
const yamlExtensionTest = /\[\[\.\.\.\w+\]\]\.(yml|yaml)$/

export default (...args: [string | LoaderOptions, string]) =>
  (nextConfig: NextConfig = {}): NextConfig => {
    const options =
      typeof args[0] === 'string'
        ? { theme: args[0], themeConfig: args[1] }
        : args[0]

    log('Initializing next config')

    const pageExtensions = nextConfig.pageExtensions ?? [...defaultExtensions]
    pageExtensions.push(...yamlExtensions)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return withPreconstruct({
      // eslint-disable-line @typescript-eslint/no-unsafe-call
      ...nextConfig,
      pageExtensions,
      webpack(config: Configuration, context) {
        log('Initializing next webpack config')
        const gspenst = new GspenstPlugin(context.isServer)
        if (config.plugins) {
          config.plugins.push(gspenst)
        } else {
          config.plugins = [gspenst]
        }

        // [Prefer `module` over `main`](https://github.com/vercel/next.js/issues/9323#issuecomment-550560435)
        // This solves the Warning: Did not expect server HTML to contain a ...
        // Note: main/cjs entry has `require()` and module/esm `import()`
        config.resolve = {
          ...config.resolve,
          mainFields: context.isServer
            ? ['module', 'main']
            : ['browser', 'module', 'main'],
        }

        config.module?.rules?.push({
          test: yamlExtensionTest,
          use: [
            context.defaultLoaders.babel,
            {
              loader: '@gspenst/next/loader',
              options: {
                staticExport,
                ...options,
                isServer: context.isServer,
              },
            },
          ],
        })

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, context)
        }

        return config
      },
      trailingSlash: true,
      reactStrictMode: true,
      // experimental: {
      //   externalDir: true, // seems to replace @preconstruc/next https://github.com/preconstruct/preconstruct/issues/444#issuecomment-1029218560
      // },
    } as NextConfig)
  }
