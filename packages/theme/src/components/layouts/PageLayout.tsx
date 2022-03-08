import { View } from '@gspenst/components'
import type { PageDocument, Root } from '../../types'
import MdxTheme from '../patterns/MdxTheme'
import Layout from './Layout'

export type PageLayoutProps = React.PropsWithChildren<{ page: PageDocument }>

const PageLayout = ({ children, ...props }: PageLayoutProps) => {
  return (
    <Layout>
      <View>
        <MdxTheme content={props.page.data.body as Root} />
        <pre>{JSON.stringify(props, null, 2)}</pre>
        {children}
      </View>
    </Layout>
  )
}

export default PageLayout
