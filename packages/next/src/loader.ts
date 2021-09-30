import type { LoaderDefinition } from 'webpack'

/* eslint-disable @typescript-eslint/no-invalid-this */

// lookup: https://webpack.js.org/api/loaders/

type Options = {}

const dynamicPage = /\[.*\]/

const loader: LoaderDefinition<Options> = function loader(source) {
  // Tells the loader-runner that the loader intends to call back asynchronously. Returns this.callback.
  const callback = this.async()

  // make this loader non cacheable
  this.cacheable(false)

  // get options passed to loader
  const options = this.getOptions()

  const { resourcePath } = this

  const filename = resourcePath.slice(resourcePath.lastIndexOf('/') + 1)

  console.log(options, filename)

  const prefix = `
# Prefix
`

  let suffix = `
# Suffix
`

  if (
    dynamicPage.test(filename) &&
    !['getStaticPaths', 'getStaticProps'].some((condition) =>
      source.includes(condition)
    )
  ) {
    const getStaticPropsPart = `
export async function getStaticProps({ params }) {
  const props = { params, foo: 'bar' }
  return { props };
}
`

    const getStaticPathsPart = `
export async function getStaticPaths() {
  const paths = { paths: [
    {
      params: { slug: ['1'] },
    },
    {
      params: { slug: ['2'] },
    },
    {
      params: { slug: ['3'] },
    },
  ], fallback: false };
  console.log(JSON.stringify(paths, null, 2));
  return paths
}
`

    suffix = suffix.concat(getStaticPropsPart, getStaticPathsPart)
  }

  source = `${prefix}\n${source}\n${suffix}`

  callback(null, source)

  return undefined
}

export default loader
