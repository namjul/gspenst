const { default: withGspenst } = require('@gspenst/next')

/**
 * @type {import('@gspenst/next')}
 */
module.exports = withGspenst({
  theme: '@gspenst/theme-minimal',
  themeConfig: './theme.config.ts',
  sources: {
    ghost: true,
    local: true,
  },
})({
  reactStrictMode: true,
  experimental: {
    // Prefer loading of ES Modules over CommonJS
    esmExternals: true,
    // externalDir: true,
  },
})
