import { createStitches } from '@stitches/core'
import type * as Stitches from '@stitches/core'
import {
  lightTheme as lightThemeConfig,
  darkTheme as darkThemeConfig,
  space,
  colors,
  media,
  utils,
} from './theme'
import type { Theme } from './theme'

const LIGHT_THEME = 'light-theme'
const DARK_THEME = 'dark-theme'

type Prefix = ''
type Media = {}
type ThemeMap = Stitches.DefaultThemeMap
type Utils = {}

const stitches = createStitches<Prefix, Media, Theme, ThemeMap, Utils>({
  theme: {
    space,
    colors,
  },
  media,
  utils,
})

export const {
  css,
  globalCss,
  keyframes,
  getCssText,
  createTheme,
  config,
  theme,
} = stitches

export type CSS = Stitches.CSS<typeof stitches>
export type CSSProps = { css?: CSS }

export const lightTheme = createTheme(LIGHT_THEME, lightThemeConfig)
export const darkTheme = createTheme(DARK_THEME, darkThemeConfig)

export const globalStyles = globalCss({})
