import { View } from '@gspenst/components'
import type { PageProps, Post } from '../../types'
import Layout from './Layout'

export type PostLayoutProps = React.PropsWithChildren<PageProps<Post>>

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
