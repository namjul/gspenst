import { createCss } from "@stitches/react";
import type { StitchesCss, ThemeRule } from "@stitches/react";
export type { StitchesVariants } from "@stitches/react";

const LIGHT_THEME = "light-theme";
const DARK_THEME = "dark-theme";

const lightThemeConfig = {};

export const darkThemeConfig = {};

const stitches = createCss({
  theme: {
    colors: {
      gray400: "gainsboro",
      gray500: "lightgray",
    },
  },
  media: {
    bp1: "(min-width: 480px)",
  },
  utils: {
    marginX: (_config) => (value) => ({
      marginLeft: value,
      marginRight: value,
    }),
  },
});

export const {
  styled,
  css,
  global: globalCss,
  keyframes,
  getCssString,
  theme,
  config,
} = stitches;

export type CSS = StitchesCss<typeof stitches>;
export type CSSProps = { css?: CSS };

/**
 * A utility type for use when extracting common styles.
 *
 * The generic parameter should be the `typeof` the variants, this is required to infer the correct props on the component.
 * This API/Typing may change with stitches versions, so only use when required.
 */
export type StyledConfig<T = undefined> = Parameters<typeof styled>[1] & {
  variants: T;
};

export type Theme = ThemeRule & string;

export const lightTheme: Theme = theme(LIGHT_THEME, lightThemeConfig);
export const darkTheme: Theme = theme(DARK_THEME, darkThemeConfig);

export const globalStyles = globalCss({});
