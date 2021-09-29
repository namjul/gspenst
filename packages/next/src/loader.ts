import { getOptions } from 'loader-utils';

/* eslint-disable @typescript-eslint/no-invalid-this */

// lookup: https://webpack.js.org/api/loaders/
var loader = function loader(source) {
  // Tells the loader-runner that the loader intends to call back asynchronously. Returns this.callback.
  var callback = this.async(); // make this loader non cacheable

  this.cacheable(false); // get options passed to loader

  var options = getOptions(this);
  console.log(options); // return value

  callback === null || callback === void 0 ? void 0 : callback(null, source);
  return undefined;
};

export { loader as default };
