import * as React from 'react'
import {
  ThemeProvider as NextThemeProvider,
  useTheme as useNextTheme,
} from 'next-themes'
import type { Theme } from '@gspenst/components'

type ThemeChoice = 'light' | 'dark'

export const useTheme = (): [ThemeChoice, () => void] => {
  const { theme: choice, setTheme } = useNextTheme()

  const toggleThemeChoice = () => {
    if (choice === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  return [choice as ThemeChoice, toggleThemeChoice]
}

type ThemeProviderProps = {
  /**
   * The light theme
   *
   */
  light?: Theme
  /**
   * The dark theme
   */
  dark?: Theme
  /**
   * Force the theme choice, if null use browser preference
   */
  choice?: ThemeChoice
  /**
   * Elements to be themed
   */
  children?: React.ReactNode
}

export const ThemeProvider = ({
  light,
  dark,
  choice,
  ...props
}: ThemeProviderProps) => {
  const themes = []
  if (light) {
    themes.push(light)
  }
  if (dark) {
    themes.push(dark)
  }
  return (
    <NextThemeProvider
      attribute="class"
      themes={themes}
      forcedTheme={choice}
      value={{ ...(dark && { dark }), ...(light && { light }) }}
      {...props}
    />
  )
}
