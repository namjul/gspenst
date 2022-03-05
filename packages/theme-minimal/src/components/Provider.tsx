import { lightTheme, darkTheme, globalStyles } from '@gspenst/components'
import ThemeProvider from './patterns/ThemeProvider'
import TinaDynamicProvider from './patterns/TinaDynamicProvider'

const Provider = ({ children }: React.PropsWithChildren<{}>) => {
  globalStyles()
  return (
    <ThemeProvider light={lightTheme} dark={darkTheme}>
      <TinaDynamicProvider>{children}</TinaDynamicProvider>
    </ThemeProvider>
  )
}

export default Provider
