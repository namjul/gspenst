import withGspenst from '@gspenst/next'
import withNextBundleAnalyzer from 'next-bundle-analyzer'

export default withNextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(withGspenst.default('@gspenst/nextra-theme-blog')({}))
