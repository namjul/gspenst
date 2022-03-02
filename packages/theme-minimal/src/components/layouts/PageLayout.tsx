import { View } from '@gspenst/components'
import type { PageDocument } from '../../types'
import Layout from './Layout'

export type PageLayoutProps = React.PropsWithChildren<{ page: PageDocument }>

const PageLayout = ({ children, ...props }: PageLayoutProps) => {
  const { page } = props

  const sections = page.data.sections ?? []

  return (
    <Layout>
      <View>
        <pre>{JSON.stringify(props, null, 2)}</pre>
        <pre>{JSON.stringify(sections, null, 2)}</pre>
        {children}
      </View>
    </Layout>
  )
}

export default PageLayout
