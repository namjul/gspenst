/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument  */

import findCacheDir from 'find-cache-dir'
import fse from 'fs-extra'
import pkg from '../package.json'

export default class Cache {
  fileCachePath: string | undefined

  constructor(name: string) {
    this.fileCachePath = findCacheDir({
      name: pkg.name,
      thunk: true,
    })?.(`${name}.json`)
    if (!this.fileCachePath) {
      throw new Error('Could not create cache file.')
    }
    fse.ensureFileSync(this.fileCachePath)
    fse.writeJsonSync(this.fileCachePath, {})
  }
  async set(data: object) {
    if (this.fileCachePath) {
      await fse.writeJson(this.fileCachePath, data)
    }
  }
  async get(): Promise<any> {
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
          reject(new Error(`Cache did not find '${this.fileCachePath}' file.`))
        }
      }
      void checkPathExists()
    })

    const fileCachePath = await cacheFileExists

    return fse.readJson(fileCachePath)
  }

  async flushall() {
    void (await this.set({}))
  }

  async hset(key: string, field: string, value: any) {
    const cache = await this.get()
    if (!cache[key]) {
      cache[key] = {}
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    cache[key]![field] = value
    await this.set(cache)
  }
  async hmget(key: string, ...fields: string[]) {
    const cache = await this.get()
    return Object.keys(cache[key] ?? {})
      .filter((field) => fields.includes(field))
      .map((field) => {
        return cache[key]?.[field]
      })
  }
  async hkeys(key: string) {
    const cache = await this.get()
    return Object.keys(cache[key] ?? {})
  }
}
