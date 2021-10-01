import path from 'path'
import type { LoaderDefinition } from 'webpack'
import type { Options, Config } from './types'

/* eslint-disable @typescript-eslint/no-invalid-this */

// lookup: https://webpack.js.org/api/loaders/

const dynamicPage = /\[.*\]/
const paramRegExp = /\[\[?\.*(.*)\]\]?/ // match dynamic routes

const loader: LoaderDefinition<Options> = function loader(source) {
  // Tells the loader-runner that the loader intends to call back asynchronously. Returns this.callback.
  const callback = this.async()

  // make this loader non cacheable
  this.cacheable(false)

  // get options passed to loader
  const options = this.getOptions()
  let { theme, themeConfig } = options

  // Relative path instead of a package name
  if (theme.startsWith('.') || theme.startsWith('/')) {
    theme = path.resolve(theme)
  }
  if (themeConfig) {
    themeConfig = path.resolve(themeConfig)
  }

  const { resourcePath } = this
  const filename = resourcePath.slice(resourcePath.lastIndexOf('/') + 1)
  const param = (
    (paramRegExp.exec(filename) ?? []) as Array<string | undefined>
  )[1]

  const config: Config = {}
  console.log(options, filename, param)

  const prefix = `
import withTheme from '${theme}'
${themeConfig ? `import themeConfig from '${themeConfig}'` : ''}

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
    const getStaticProps = `
export async function getStaticProps({ params }) {
  const props = { params, foo: 'bar' }
  return { props };
}
`

    const getStaticPaths = `
export async function getStaticPaths() {
  const paths = { paths: [
    {
      params: { ${param}: [] },
    },
    {
      params: { ${param}: ['1'] },
    },
    {
      params: { ${param}: ['2'] },
    },
    {
      params: { ${param}: ['3'] },
    },
  ], fallback: false };
  console.log(JSON.stringify(paths, null, 2));
  return paths
}
`

    suffix = suffix.concat(getStaticProps, getStaticPaths)
  }

  const layout = `
export default function TemplatePage (props) {
    return withTheme(${JSON.stringify(config)}, ${
    themeConfig ? 'themeConfig' : 'null'
  })(props)
}
`

  suffix = suffix.concat(layout)

  source = `${prefix}\n${source}\n${suffix}`

  callback(null, source)

  return undefined
}

export default loader
