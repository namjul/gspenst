import { FC } from 'react'
import {
  type PageMapItem,
  type ThemeContext,
  type Entity,
  type Pagination,
  type Option,
  type Json,
} from 'gspenst'
import { GSPENT_INTERNAL } from './constants'

export type Theme = string

export type GspenstConfig = {
  theme: Theme
}

export interface LoaderOptions extends GspenstConfig {
  isServer?: boolean
  isStaticHTMLExport: boolean
}

export type ThemeConfig = Json

export type ContextNew = Pick<
  ThemeContext,
  'templates' | 'context' | 'route'
> & {
  config: Json
  entry: Entity
  data: Record<
    string,
    {
      resources: Entity[]
      pagination: Option<Pagination>
    }
  >
}

export type GspenstThemeLayoutProps = {
  pageMap: PageMapItem[]
  context: ContextNew
}

export type GspenstInternalGlobal = typeof globalThis & {
  [GSPENT_INTERNAL]: {
    Layout: FC<GspenstThemeLayoutProps>
    pageMap: PageMapItem[]
  }
}
