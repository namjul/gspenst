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

  const isLight = choice === 'light'
  const icon = isLight ? <div>LightMode</div> : <div>DarkMode</div>
  const title = isLight ? 'Use dark theme' : 'Use light theme'

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
