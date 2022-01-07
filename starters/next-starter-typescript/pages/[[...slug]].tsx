import type {
  NextPage,
  InferGetStaticPropsType,
  GetStaticProps,
  GetStaticPaths,
} from 'next'
import { View } from '@gspenst/components'
import { getAllPaths, getPageProps } from '@gspenst/next/server'
// import type { Entry } from '@gspenst/next'
// import type { Post, Tag } from '@gspenst/next'
// import type { PropsWithChildren } from 'react'
// import NextLink from 'next/link'
// import type { LinkProps as NextLinkProps } from 'next/link'

// const Link = (props: PropsWithChildren<NextLinkProps>) => {
//   const { children, ...linkProps } = props
//   return (
//     <NextLink {...linkProps} passHref>
//       <a href="passRef">{children}</a>
//     </NextLink>
//   )
// }

const Page: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = (
  entry
) => {
  console.log(entry)
  return (
    <View>
      <View css={{ color: 'red' }}>@gspenst/next-starter-typescript</View>
      <div key={entry.id}>
        {entry.title} {new Date(entry.created).toString()}
      </div>
    </View>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  console.log('Page [...slug].js getStaticPaths')
  const paths = await getAllPaths()
  console.log(paths)
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async (context) => {
  console.log('Page [...slug].js getStaticProps, params: ', context.params)
  const props = await getPageProps(context)
  return { props }

  // const entries = await getEntries(params.slug[0])

  // const featuredPosts = posts.filter((post) => post.featured).slice(0, 10)
  // const recentPosts = posts
  //   .sort((a, b) => Number(new Date(b.created)) - Number(new Date(a.created)))
  //   .slice(0, 6)

  // return {
  //   props: {
  //     entries: [],
  //   },
  // }
}

export default Page
