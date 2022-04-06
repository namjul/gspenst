import type { PageProps } from '@gspenst/next'
import defaultConfig from '../default.config'
import { ThemeConfigContext } from '../config'

const Page = (props: PageProps) => {
  const extendedConfig = { ...defaultConfig }

  return (
    <ThemeConfigContext.Provider value={extendedConfig}>
      From `@gspenst/next`
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </ThemeConfigContext.Provider>
  )
}

export default () => {
  return Page
}
