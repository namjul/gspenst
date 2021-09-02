import React from 'react'
import { Meta } from '@storybook/react'
import { Text } from '.'

const meta: Meta = {
  title: 'Components/Text',
  component: Text,
}

export default meta

export const Default: React.FC = () => <Text>Text</Text>
