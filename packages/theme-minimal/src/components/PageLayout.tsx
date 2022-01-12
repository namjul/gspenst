import { View } from '@gspenst/components'

export type PageLayoutProps = {
  children?: React.ReactNode | undefined
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return <View>{children}</View>
}

export default PageLayout
