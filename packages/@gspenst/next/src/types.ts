export type Theme = string
export type GspenstConfig = {
  theme: Theme
}

export interface LoaderOptions extends GspenstConfig {
  isServer?: boolean
  isStaticHTMLExport: boolean
}
