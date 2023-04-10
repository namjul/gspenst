import path from 'path'
import fse from 'fs-extra'
import withPreconstruct from '@preconstruct/next'
import { type Configuration } from 'webpack' // eslint-disable-line import/no-extraneous-dependencies
import { type NextConfig } from 'next'
import { env } from 'gspenst'
import { log } from './logger'
import { type LoaderOptions } from './loader'
import {
  YAML_EXTENSION_REGEX,
  DEFAULT_EXTENSIONS,
  YAML_EXTENSIONS,
} from './constants'
// import { GspenstPlugin } from './plugin'

const mediaDir = path.join(
  process.cwd(),
  env.NEXT_PUBLIC_TINA_PUBLIC_DIR,
  env.NEXT_PUBLIC_TINA_MEDIA_ROOT
)

// make sure that uploads folder exist
void fse.ensureDir(mediaDir)

export default (...args: [string | LoaderOptions, string]) =>
  (nextConfig: NextConfig = {}): NextConfig => {
    const options =
      typeof args[0] === 'string'
        ? { theme: args[0], themeConfig: args[1] }
        : args[0]

    log('Initializing next config')

    const pageExtensions = nextConfig.pageExtensions ?? [...DEFAULT_EXTENSIONS]
    pageExtensions.push(...YAML_EXTENSIONS)

    const rewrites = async () => {
      const rules = [
        {
          source: '/admin',
          destination: '/admin/index.html',
        },
      ]

      if (nextConfig.rewrites) {
        const originalRewrites = await nextConfig.rewrites()
        if (Array.isArray(originalRewrites)) {
          return [...originalRewrites, ...rules]
        }
        return {
          ...originalRewrites,
          beforeFiles: [...originalRewrites.beforeFiles, ...rules],
        }
      }

      return rules
    }

    // https://nextjs.org/docs/advanced-features/static-html-export
    const isStaticHTMLExport = nextConfig.output === 'export'

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return withPreconstruct({
      // eslint-disable-line @typescript-eslint/no-unsafe-call
      ...nextConfig,
      pageExtensions,
      webpack(config: Configuration, context) {
        log('Initializing next webpack config')
        // const gspenst = new GspenstPlugin(context.isServer)
        // if (config.plugins) {
        //   config.plugins.push(gspenst)
        // } else {
        //   config.plugins = [gspenst]
        // }

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
          test: YAML_EXTENSION_REGEX,
          use: [
            context.defaultLoaders.babel,
            {
              loader: '@gspenst/next/loader',
              options: {
                ...options,
                isStaticHTMLExport,
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
      ...(isStaticHTMLExport ? {} : { rewrites }),
      trailingSlash: true,
      reactStrictMode: true,
      swcMinify: true,
      experimental: {
        // https://nextjs.org/docs/messages/import-esm-externals
        // esmExternals: 'loose',
        // externalDir: true, // seems to replace @preconstruc/next https://github.com/preconstruct/preconstruct/issues/444#issuecomment-1029218560
      },
    } as NextConfig)
  }
