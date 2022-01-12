import { View } from '@gspenst/components'

export type PostLayoutProps = {
  children?: React.ReactNode | undefined
}

const PostLayout = ({ children }: PostLayoutProps) => {
  return <View>{children}</View>
}

export default PostLayout
