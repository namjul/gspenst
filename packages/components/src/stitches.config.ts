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

const LIGHT_THEME = 'light-theme'
const DARK_THEME = 'dark-theme'

const stitches = createStitches({
  theme: {
    space,
    colors,
  },
  media,
  utils,
})

export const { css, globalCss, keyframes, getCssText, createTheme, config } =
  stitches

export type CSS = Stitches.CSS<typeof stitches>
export type CSSProps = { css?: CSS }

export const lightTheme = createTheme(LIGHT_THEME, lightThemeConfig)
export const darkTheme = createTheme(DARK_THEME, darkThemeConfig)

export const globalStyles = globalCss({})
