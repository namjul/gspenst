import type * as Stitches from '@stitches/core'

export const utils = {
  mx: (value: Stitches.ScaleValue<'space'>) => ({
    marginLeft: value,
    marginRight: value,
  }),
}
