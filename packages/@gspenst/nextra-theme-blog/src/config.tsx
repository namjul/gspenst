import { type SchemaField } from 'gspenst'
// import { type ConfigPartsFragment } from '../.tina/__generated__/types'

export type NextraBlogTheme = {
  readMore?: string
  footer?: React.ReactNode
  titleSuffix: string | undefined
  postFooter: string | undefined
  head?: ({
    title,
    meta,
  }: {
    title: string
    meta: Record<string, any>
  }) => React.ReactNode
  cusdis?: {
    appId: string
    host?: string
    lang: string
  }
  darkMode?: boolean
  navs?: {
    url: string
    name: string
  }[]
}

export type TinaConfig = Record<string, any>

export const defaultConfig = {
  readMore: 'Read More →',
  footer: (
    <small style={{ display: 'block', marginTop: '8rem' }}>my footer</small>
  ),
  titleSuffix: 'titleSuffix',
  postFooter: null,
}

export const fields: SchemaField[] = [
  {
    type: 'boolean',
    label: 'Dark Mode',
    name: 'darkMode',
  },
]
