import type { NextConfig } from 'next'
import withNextra from 'nextra'

export type ThemeConfig = {
  filename: string
  route: string
  meta: string
  pageMap: string
}

export default (...args: string[] | { theme: string; themeConfig: string }[]) =>
  (nextConfig: NextConfig = {}) => {
    return withNextra(...args)({ ...nextConfig })
  }
