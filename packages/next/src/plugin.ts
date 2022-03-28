import EventEmitter from 'events'
import path from 'path'
import debug from 'debug'
import findCacheDir from 'find-cache-dir'
import fse from 'fs-extra'
import { Compiler } from 'webpack'
import pkg from '../package.json'
import { getResources, ResourceItem } from './data-utils'
import { startTinaServer } from './tinaServer'

const FILE_CACHE_PATH = findCacheDir({
  name: pkg.name,
  thunk: true,
})?.('slug-collection-cache.json')

export class ResourceMapCache {
  async set(data: ResourceItem[]) {
    if (FILE_CACHE_PATH) {
      await fse.ensureFile(FILE_CACHE_PATH)
      await fse.writeJson(FILE_CACHE_PATH, data)
    }
  }
  async get(): Promise<ResourceItem[]> {
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
        const pathExists = await fse.pathExists(FILE_CACHE_PATH ?? '')
        if (!pathExists && numOfRetries < maxNumOfRetries) {
          numOfRetries += 1
          console.log(
            `error in server.getData(), cache file '${FILE_CACHE_PATH}' was not found, waiting ${retryDelay}ms and retry #${numOfRetries}`
          )
          setTimeout(checkPathExists, retryDelay)
        } else if (pathExists) {
          resolve(FILE_CACHE_PATH as string)
        } else {
          reject(
            new Error(
              `sourcebitDataClient of the sourcebit-target-next plugin did not find '${FILE_CACHE_PATH}' file. Please check that other Sourcebit plugins are executed successfully.`
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
    void this.set([])
  }
}

export const resourceMapCache = new ResourceMapCache()

const key = `${pkg.name}:plugin`
const log = debug(key)
let instance: GspenstPlugin | null = null

export class GspenstPlugin extends EventEmitter {
  isServer: boolean
  compiler?: Compiler
  packagePath: string = path.dirname(
    require.resolve(`@gspenst/next/package.json`)
  )
  projectPath: string = process.cwd()
  state: { starting?: Promise<void> }

  constructor(isServer: boolean) {
    super()

    this.isServer = isServer

    instance = this
    this.state = {}

    process.on('exit', () => {
      this.emit('cleanup')
    })
  }

  apply(compiler: Compiler) {
    this.compiler = compiler

    // only allow once instance of the plugin to run for a build
    if (instance !== this) {
      return
    }

    this.hook()
  }

  hook() {
    if (this.compiler) {
      const { beforeCompile } = this.compiler.hooks

      beforeCompile.tapPromise(key, async () => {
        await this.start()
        await this.collect()
      })
    }
  }

  async start() {
    if (!this.state.starting) {
      // ensure we're only trying to start the server once
      this.state.starting = startTinaServer.bind(this)()
      // this.state.starting.then(() => newline());
    }

    // wait for the server to startup so we can get our client connection info from it
    await this.state.starting
  }

  async collect() {
    log('Collect Resources')
    const resources = await getResources()
    await resourceMapCache.set(resources)
  }
}
