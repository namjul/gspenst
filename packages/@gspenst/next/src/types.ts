export type Theme = string
export type GspenstConfig = {
  theme: Theme
  themeConfig?: string // TODO remove
}

export type LoaderOptions = {
  theme: string
  themeConfig?: string
  isServer?: boolean
  isStaticHTMLExport: boolean
}
