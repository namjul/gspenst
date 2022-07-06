import type { TinaField } from 'gspenst'

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

export const defaultConfig = {
  readMore: 'Read More →',
  footer: (
    <small style={{ display: 'block', marginTop: '8rem' }}>
      CC BY-NC 4.0 2020 © Shu Ding.
    </small>
  ),
  titleSuffix: 'titleSuffix',
  postFooter: null,
}

export const fields: TinaField[] = [
  {
    type: 'boolean',
    label: 'Dark Mode',
    name: 'darkMode',
  },
]
