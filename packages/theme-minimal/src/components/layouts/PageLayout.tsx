import { View } from '@gspenst/components'
import type { PageProps } from '../../utils/dataTransformer'
import type { PageDocument, GlobalDocument } from '../../types'
import Layout from './Layout'

export type PageLayoutProps = React.PropsWithChildren<
  Extract<PageProps, { global: GlobalDocument; page: PageDocument }>
>

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
