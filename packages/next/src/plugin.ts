import EventEmitter from 'events'
import type { ChildProcess } from 'child_process'
import path from 'path'
import debug from 'debug'
import { Compiler } from 'webpack'
import pkg from '../package.json'
import { startTinaServer } from './tinaServer'
import repository from './repository'
import { format } from './errors'

// api lookup: https://webpack.js.org/api/plugins/
// example: https://github.com/shellscape/webpack-plugin-serve/blob/master/lib/index.js

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
  state: { starting?: Promise<ChildProcess> }

  constructor(isServer: boolean) {
    super()

    this.isServer = isServer

    // eslint-disable-next-line @typescript-eslint/no-this-alias
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
    const result = await repository.init()
    if (result.isErr()) {
      const error = format(result.error)
      log(error)
      const tinaServer = await this.state.starting
      if (tinaServer) {
        tinaServer.kill()
        process.exit(1)
      }
    }
  }
}
