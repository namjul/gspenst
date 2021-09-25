import withNextra from 'nextra'
import type { NextConfig } from 'next'

export type Config = {
  filename: string
  route: string
  meta: string
  pageMap: string
}

export default (...args: string[] | { theme: string; themeConfig: string }[]) =>
  (nextConfig: NextConfig = {}) => {
    return withNextra(...args)({ ...nextConfig })
  }
