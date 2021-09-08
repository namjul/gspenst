import {
  grayDark,
  sandDark,
  yellowDark,
  blueDark,
  redDark,
  greenDark,
  orangeDark,
} from '@radix-ui/colors'
import { colors } from './tokens/colors'

export const darkTheme = {
  colors: {
    ...grayDark,
    ...sandDark,
    ...yellowDark,
    ...blueDark,
    ...redDark,
    ...greenDark,
    ...orangeDark,

    ...colors,
  },
}
