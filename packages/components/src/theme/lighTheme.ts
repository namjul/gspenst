import { gray, sand, yellow, blue, red, green, orange } from '@radix-ui/colors'
import { colors } from './tokens/colors'

export const lightTheme = {
  colors: {
    ...gray,
    ...sand,
    ...yellow,
    ...blue,
    ...red,
    ...green,
    ...orange,

    ...colors,
  },
}
