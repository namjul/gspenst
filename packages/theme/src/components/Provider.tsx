import { lightTheme, darkTheme, globalStyles } from '@gspenst/components'
import ThemeProvider from './patterns/ThemeProvider'

const Provider = ({ children }: React.PropsWithChildren<{}>) => {
  globalStyles()
  return (
    <ThemeProvider light={lightTheme} dark={darkTheme}>
      {children}
    </ThemeProvider>
  )
}

export default Provider
