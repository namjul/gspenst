import type { LoaderDefinition } from 'webpack'

/* eslint-disable @typescript-eslint/no-invalid-this */

// lookup: https://webpack.js.org/api/loaders/

type Options = {}

const loader: LoaderDefinition<Options> = function loader(source) {
  // Tells the loader-runner that the loader intends to call back asynchronously. Returns this.callback.
  const callback = this.async()

  // make this loader non cacheable
  this.cacheable(false)

  // get options passed to loader
  const options = this.getOptions()

  console.log(options)

  callback(null, source)

  return undefined
}

export default loader
