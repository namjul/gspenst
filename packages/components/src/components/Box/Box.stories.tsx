import React from 'react'
import { Meta } from '@storybook/react'
import { Box } from '.'

const meta: Meta = {
  title: 'Components/Box',
  component: Box,
}

export default meta

export const Default: React.FC = () => <Box>I am a Box</Box>
