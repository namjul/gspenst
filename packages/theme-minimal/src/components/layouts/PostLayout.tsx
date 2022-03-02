import { View } from '@gspenst/components'
import type { PostDocument } from '../../types'
import Layout from './Layout'

export type PostLayoutProps = React.PropsWithChildren<{ page: PostDocument }>

const PostLayout = ({ children, ...props }: PostLayoutProps) => {
  return (
    <Layout>
      <View>
        <pre>{JSON.stringify(props, null, 2)}</pre>
        {children}
      </View>
    </Layout>
  )
}

export default PostLayout
