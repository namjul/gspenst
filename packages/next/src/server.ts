import type { GetStaticProps, GetStaticPaths } from 'next'
import type { Routing } from './types'

function getStaticFunctions(routing: Routing, param: string) {
  const getStaticPaths: GetStaticPaths = async () => {
    console.log('Page [...slug].js getStaticPaths, routing', routing)

    const paths = [
      {
        params: {
          [param]: ['home'],
        },
      },
    ]

    return { paths, fallback: false }
  }

  const getStaticProps: GetStaticProps = async ({ params }) => {
    console.log(
      'Page [...slug].js getStaticProps, params: ',
      JSON.stringify(params, null, 2)
    )

    const props = {
      routing,
      params,
      param,
    }

    return { props }
  }

  return {
    getStaticPaths,
    getStaticProps,
  }
}

export default getStaticFunctions
