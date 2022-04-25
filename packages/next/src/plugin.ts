import EventEmitter from 'events'
import type { ChildProcess } from 'child_process'
import path from 'path'
import debug from 'debug'
import { Compiler } from 'webpack'
import pkg from '../package.json'
import { startTinaServer } from './tinaServer'

// api lookup: https://webpack.js.org/api/plugins/
// example: https://github.com/shellscape/webpack-plugin-serve/blob/master/lib/index.js

const key = `${pkg.name}:plugin`
const log = debug(key)
let instance: GspenstPlugin | null = null
const state: { starting?: Promise<ChildProcess> } = {}

export class GspenstPlugin extends EventEmitter {
  isServer: boolean
  compiler?: Compiler
  packagePath: string = path.dirname(
    require.resolve(`@gspenst/next/package.json`)
  )
  projectPath: string = process.cwd()

  constructor(isServer: boolean) {
    super()

    this.isServer = isServer

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    instance = this

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
      })
    }
  }

  async start() {
    if (!state.starting) {
      // ensure we're only trying to start the server once
      state.starting = startTinaServer.bind(this)()
    }

    // wait for the server to startup
    await state.starting
    log('Server starterd')
  }
}
