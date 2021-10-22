import type { NextPage, InferGetStaticPropsType } from 'next'
import { View } from '@gspenst/components'
import { getEntries } from '@gspenst/next'
import type { Post } from '@gspenst/next'

export const getStaticProps = async () => {
  const posts = await getEntries<Post>('post')

  const featuredPosts = posts.filter((post) => post.featured).slice(0, 10)
  const recentPosts = posts
    .sort((a, b) => Number(new Date(b.created)) - Number(new Date(a.created)))
    .slice(0, 6)

  return {
    props: {
      posts,
      featuredPosts,
      recentPosts,
    },
  }
}
const IndexPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  posts = [],
  recentPosts = [],
  featuredPosts = [],
}) => {
  return (
    <View>
      <View css={{ color: 'red' }}>@gspenst/next-starter-typescript</View>

      <View>
        <View as="h2">Recent Posts</View>
        {recentPosts.map((post) => (
          <div key={post.id}>
            {post.title} {new Date(post.created).toString()}
          </div>
        ))}
        <View as="h2">Features Posts</View>
        {featuredPosts.map((post) => (
          <div key={post.id}>{post.title}</div>
        ))}

        <View as="h2">Posts</View>
        {posts.map((post) => (
          <div key={post.id}>{post.title}</div>
        ))}
      </View>
    </View>
  )
}

export default IndexPage
