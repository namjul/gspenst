import type { FC } from 'react'
import { Meta } from '@storybook/react'
import { View } from '.'

const meta: Meta = {
  title: 'Components/View',
  component: View,
}

export default meta

export const Default: FC = () => <View>This is a View</View>

export const CSSProp: FC = () => (
  <View css={{ backgroundColor: 'blue', color: 'white', padding: 12 }}>
    This is a View
  </View>
)

export const AsProp = () => (
  <View as="article">This is a View as a article</View>
)
