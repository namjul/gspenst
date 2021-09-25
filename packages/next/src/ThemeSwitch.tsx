import * as React from 'react'
import { View } from '@gspenst/components'
import type { ViewProps } from '@gspenst/components'
import { useTheme } from './ThemeProvider'

type ThemeSwitchProps = ViewProps & {}

export const ThemeSwitch = React.forwardRef<
  HTMLButtonElement,
  ThemeSwitchProps
>((props, ref) => {
  const [choice, toggle] = useTheme()

  const isDark = choice === 'dark'
  const icon = isDark ? 'DarkMode' : 'LightMode'
  const title = isDark ? 'Use light theme' : 'Use dark theme'

  return (
    <View
      as="button"
      ref={ref}
      onClick={toggle}
      title={title}
      aria-label="switch-theme"
      {...props}
      css={{ color: '$gray11', backgroundColor: '$gray2' }}
    >
      {icon}
    </View>
  )
})
