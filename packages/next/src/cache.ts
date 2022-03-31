import findCacheDir from 'find-cache-dir'
import fse from 'fs-extra'
import pkg from '../package.json'

export class Cache<T> {
  fileCachePath?: string

  constructor(name: string) {
    this.fileCachePath = findCacheDir({
      name: pkg.name,
      thunk: true,
    })?.(`${name}.json`)
  }
  async set(data?: T) {
    if (this.fileCachePath) {
      await fse.ensureFile(this.fileCachePath)
      await fse.writeJson(this.fileCachePath, data)
    }
  }
  async get(): Promise<T> {
    // from https://github.com/stackbit/sourcebit-target-next/blob/master/lib/data-client.js

    // Every time getStaticPaths is called, the page re-imports all required
    // modules causing this singleton to be reconstructed loosing any in
    // memory cache.
    // https://github.com/zeit/next.js/issues/10933
    //
    // For now, we are reading the changes from filesystem until re-import
    // of this module will be fixed: https://github.com/zeit/next.js/issues/10933
    // TODO: FILE_CACHE_PATH won't work if default cache file path
    //   was changed, but also can't access the specified path because
    //   nextjs re-imports the whole module when this method is called

    const cacheFileExists = new Promise<string>((resolve, reject) => {
      const retryDelay = 500
      const maxNumOfRetries = 10
      let numOfRetries = 0
      const checkPathExists = async () => {
        const pathExists = await fse.pathExists(this.fileCachePath ?? '')
        if (!pathExists && numOfRetries < maxNumOfRetries) {
          numOfRetries += 1
          console.log(
            `error in server.getData(), cache file '${this.fileCachePath}' was not found, waiting ${retryDelay}ms and retry #${numOfRetries}`
          )
          setTimeout(checkPathExists, retryDelay)
        } else if (pathExists) {
          resolve(this.fileCachePath as string)
        } else {
          reject(
            new Error(
              `sourcebitDataClient of the sourcebit-target-next plugin did not find '${this.fileCachePath}' file. Please check that other Sourcebit plugins are executed successfully.`
            )
          )
        }
      }
      void checkPathExists()
    })

    const fileCachePath = await cacheFileExists

    return fse.readJson(fileCachePath)
  }
  async clear() {
    void this.set()
  }
}
