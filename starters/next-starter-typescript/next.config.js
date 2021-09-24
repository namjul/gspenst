const { default: withGspenst } = require('@gspenst/next')

/**
 * @type {import('next').NextConfig}
 */
module.exports = withGspenst({
  theme: '@gspenst/theme-minimal',
  themeConfig: './theme.config.ts',
})({
  // experimental: {
  //   externalDir: true,
  // },
  // webpack: (config) => {
  //   config.module.rules.push({
  //     test: /\.ts?$/,
  //     use: ['ts-loader'],
  //   })
  //
  //   return config
  // },
  reactStrictMode: true,

  experimental: {
    // Prefer loading of ES Modules over CommonJS
    esmExternals: true,
  },
})
