import type { ReactNode } from 'react'
import {
  ThemeProvider as NextThemeProvider,
  useTheme as useNextTheme,
} from 'next-themes'
import type { Theme } from '@gspenst/components'

type ThemeChoice = 'light' | 'dark'

export const useTheme = (): [ThemeChoice, () => void] => {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- until https://github.com/pacocoursey/next-themes/issues/94 is solved  */
  const { theme: choice, setTheme } = useNextTheme()

  const toggleThemeChoice = () => {
    if (choice === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }
  /* eslint-enable */

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
   * Force the theme choice
   */
  choice?: ThemeChoice
  /**
   * Elements to be themed
   */
  children?: ReactNode
}

const ThemeProvider = ({
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
      value={{
        ...(dark && { dark: dark.toString() }),
        ...(light && { light: light.toString() }),
      }}
      enableSystem
      enableColorScheme={false}
      {...props}
    />
  )
}

export default ThemeProvider
