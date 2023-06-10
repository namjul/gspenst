import withGspenst from '@gspenst/next'
// import withNextBundleAnalyzer from '@next/bundle-analyzer'
import withNextBundleAnalyzer from 'next-bundle-analyzer'

export default withNextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(
  withGspenst.default('./theme')({
    productionBrowserSourceMaps: true,
  })
)
