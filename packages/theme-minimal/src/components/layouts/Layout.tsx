import { View } from '@gspenst/components'
import ThemeSwitch from '../patterns/ThemeSwitch'
import EditButton from '../patterns/EditButton'
import Link from '../patterns/Link'
import { useConfig } from '../../config'

export type LayoutProps = React.PropsWithChildren<{}>

const Layout = ({ children }: LayoutProps) => {
  const config = useConfig()

  return (
    <View as="main" css={{ color: '$gray11', backgroundColor: '$gray2' }}>
      {config.darkMode && <ThemeSwitch />}
      <EditButton />
      <Link href="https://example.com" target="_blank">
        link
      </Link>
      {children}
    </View>
  )
}

export default Layout
