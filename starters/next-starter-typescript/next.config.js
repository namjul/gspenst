const { default: withGspenst } = require('@gspenst/next')

/**
 * @type {import('@gspenst/next')}
 */
module.exports = withGspenst({
  theme: '@gspenst/theme-minimal',
  themeConfig: './theme.config.js',
  sources: {
    // ghost: true,
    // local: true,
    sample: true,
  },
  plugins: [
    {
      resolve: 'sample-plugin',
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
})({})
