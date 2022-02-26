import { View } from '@gspenst/components'
import type { PageProps, Page } from '../../types'
import Layout from './Layout'

export type PageLayoutProps = React.PropsWithChildren<PageProps<Page>>

const PageLayout = ({ children, ...props }: PageLayoutProps) => {
  return (
    <Layout>
      <View>
        <pre>{JSON.stringify(props, null, 2)}</pre>
        {children}
      </View>
    </Layout>
  )
}

export default PageLayout
