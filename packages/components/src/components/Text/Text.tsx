import * as React from 'react'
import { Box, BoxProps } from '../Box'
import { CSSProps } from '../../stitches.config'

type Ref = HTMLParagraphElement
export type TextProps = BoxProps & CSSProps

export const Text = React.forwardRef<Ref, TextProps>((props, ref) => {
  return <Box ref={ref} as="p" {...props} />
})
