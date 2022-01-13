import { View } from '@gspenst/components'
import type { PageProps } from '@gspenst/next'

export type PageLayoutProps = React.PropsWithChildren<PageProps>

const PageLayout = ({ entry, props, children }: PageLayoutProps) => {
  return (
    <View>
      <pre>{JSON.stringify(entry, null, 2)}</pre>
      <pre>{JSON.stringify(props, null, 2)}</pre>
      {children}
    </View>
  )
}

export default PageLayout
