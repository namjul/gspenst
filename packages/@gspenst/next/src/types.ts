import { FC } from 'react'
import { type PageMapItem, type ThemeContext } from 'gspenst'
import { GSPENT_INTERNAL } from './constants'

export type Theme = string

export type GspenstConfig = {
  theme: Theme
}

export interface LoaderOptions extends GspenstConfig {
  isServer?: boolean
  isStaticHTMLExport: boolean
}

export type GspenstInternalGlobal = typeof globalThis & {
  [GSPENT_INTERNAL]: {
    Layout: FC<any>
    pageMap: PageMapItem[]
  }
}

export type GspenstThemeLayoutProps = {
  context: ThemeContext
  pageMap: PageMapItem[]
}
