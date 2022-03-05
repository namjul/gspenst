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
  prefix: 'gspenst',
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
export type Theme = ReturnType<typeof createTheme>

export const lightTheme = createTheme(LIGHT_THEME, lightThemeConfig)
export const darkTheme = createTheme(DARK_THEME, darkThemeConfig)

export const globalStyles = globalCss({
  // From https://www.joshwcomeau.com/css/custom-css-reset/

  /*
  Use a more -intuitive box-sizing mode.
  */
  '*, *::before, *::after': {
    boxSizing: 'border-box',
  },

  /*
  Remove default marings
  */
  '*': {
    margin: 0,
  },

  /*
  Allow percentage-based heights in the application
  */
  'html, body, #__next': {
    height: '100%',
  },

  /*
  Typographic tweaks!
  4. Add accessible line-height
  5. Improve text rendering
  */
  body: {
    lineHeight: 1.5,
    '-webkit-font-smoothing': 'antialiased',
  },

  /*
  6. Improve media defaults
  */
  'img, picture, video, canvas, svg': {
    display: 'block',
    maxWidth: '100%',
  },

  /*
  7. Remove built-in form typography styles
  */
  'input, button, textarea, select': {
    font: 'inherit',
  },

  /*
  8. Avoid text overflows
  */
  'p, h1, h2, h3, h4, h5, h6': {
    overflowWrap: 'break-word',
  },

  /*
  9. Create a root stacking context
  */
  '#root, #__next': {
    isolation: 'isolate',
  },
})
