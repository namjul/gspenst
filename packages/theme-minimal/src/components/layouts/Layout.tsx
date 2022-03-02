import { View } from '@gspenst/components'
import { ThemeSwitch } from '../patterns/ThemeSwitch'
import { EditButton } from '../patterns/EditButton'
import { useConfig } from '../../config'

export type LayoutProps = React.PropsWithChildren<{}>

const Layout = ({ children }: LayoutProps) => {
  const config = useConfig()

  console.log('Layout.config: ', config)

  return (
    <View as="main" css={{ color: '$gray11', backgroundColor: '$gray2' }}>
      {config.data.darkMode && <ThemeSwitch />}
      <EditButton />
      {children}
    </View>
  )
}

export default Layout
