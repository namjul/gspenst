import { View } from '@gspenst/components'
import type { PageProps } from '@gspenst/next'

export type PostLayoutProps = React.PropsWithChildren<PageProps>

const PostLayout = ({ entry, props, children }: PostLayoutProps) => {
  return (
    <View>
      <pre>{JSON.stringify(entry, null, 2)}</pre>
      <pre>{JSON.stringify(props, null, 2)}</pre>
      {children}
    </View>
  )
}

export default PostLayout
