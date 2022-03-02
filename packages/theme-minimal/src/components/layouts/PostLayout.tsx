import { View } from '@gspenst/components'
import type { PageProps } from '../../utils/dataTransformer'
import type { PostDocument, GlobalDocument } from '../../types'
import Layout from './Layout'

export type PostLayoutProps = React.PropsWithChildren<
  Extract<PageProps, { global: GlobalDocument; page: PostDocument }>
>

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
