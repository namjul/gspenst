import { View } from '@gspenst/components'
import type { PostDocument, Root } from '../../types'
import MdxTheme from '../patterns/MdxTheme'
import Layout from './Layout'

export type PostLayoutProps = React.PropsWithChildren<{ page: PostDocument }>

const PostLayout = ({ children, ...props }: PostLayoutProps) => {
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

export default PostLayout
