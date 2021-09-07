import { createStitches } from '@stitches/core'
import type * as Stitches from '@stitches/core'

const LIGHT_THEME = 'light-theme'
const DARK_THEME = 'dark-theme'

const lightThemeConfig = {}

export const darkThemeConfig = {}

const stitches = createStitches({
  theme: {
    space: {
      0: '0px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '24px',
      6: '32px',
      7: '48px',
      8: '64px',
      9: '96px',
      10: '128px',
      11: '192px',
      12: '256px',
      13: '384px',
      14: '512px',
      15: '640px',
      16: '768px',
    },
    colors: {
      gray400: 'gainsboro',
      gray500: 'lightgray',
    },
  },
  media: {
    bp1: '(min-width: 480px)',
  },
  utils: {
    mx: (value: Stitches.ScaleValue<'space'>) => ({
      marginLeft: value,
      marginRight: value,
    }),
  },
})

export const { css, globalCss, keyframes, getCssText, createTheme, config } =
  stitches

export type CSS = Stitches.CSS<typeof stitches>
export type CSSProps = { css?: CSS }

export const lightTheme = createTheme(LIGHT_THEME, lightThemeConfig)
export const darkTheme = createTheme(DARK_THEME, darkThemeConfig)

export const globalStyles = globalCss({})
