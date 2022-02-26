import { View } from '@gspenst/components'
import type { Page } from '../../types'
import Layout from './Layout'

export type PageLayoutProps = React.PropsWithChildren<Page>

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
