const { default: withGspenst } = require('@gspenst/next')

/**
 * @type {import('@gspenst/next')}
 */
module.exports = withGspenst({
  theme: '@gspenst/theme-minimal',
  themeConfig: './theme.config.ts',
  sources: {
    // ghost: true,
    // local: true,
    sample: true,
  },
  plugins: [
    {
      resolve: '@gspenst/sourcebit-sample-plugin',
      options: {},
    },
    // {
    //   resolve: '@gspenst/source-ghost-plugin',
    //   options: {},
    // },
    // {
    //   resolve: '@gspenst/source-local-plugin',
    //   options: {},
    // },
    // {
    //   resolve: '@gspenst/source-dendron-plugin',
    //   options: {},
    // },
    // {
    //   resolve: '@gspenst/source-contenful-plugin',
    //   options: {},
    // },
  ],
})({
  reactStrictMode: true,
  experimental: {
    // Prefer loading of ES Modules over CommonJS
    esmExternals: true,
    // externalDir: true,
  },
})
