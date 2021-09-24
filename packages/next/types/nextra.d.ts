declare module 'nextra' {
  import type { NextConfig } from 'next'
  function withNextra(
    ...args: string[] | { theme: string; themeConfig: string }[]
  ): (nextConfig: NextConfig) => NextConfig
  export default withNextra
}
