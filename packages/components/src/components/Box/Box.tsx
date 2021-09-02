import * as React from 'react'
import { styled } from '../../stitches.config'

export const Box = styled('div', {
  boxSizing: 'border-box',
})

export type BoxProps = React.ComponentProps<typeof Box>
