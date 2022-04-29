import withGspenst from '@gspenst/next'

export default withGspenst.default('./theme')({
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

})
