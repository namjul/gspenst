import EventEmitter from 'events'
import  { type ChildProcess } from 'child_process'
import path from 'path'
import  { type Compiler } from 'webpack'  // eslint-disable-line import/no-extraneous-dependencies
import { startTinaServer } from 'gspenst/server'
import pkg from '../package.json'

// api lookup: https://webpack.js.org/api/plugins/
// example: https://github.com/shellscape/webpack-plugin-serve/blob/master/lib/index.js

const key = `${pkg.name}:plugin`
const state: { starting?: Promise<ChildProcess | undefined> } = {}

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

    process.on('exit', () => {
      this.emit('cleanup')
    })
  }

  apply(compiler: Compiler) {
    this.compiler = compiler

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
      state.starting = startTinaServer.bind(this)({ onlyCheck: true })
    }

    // wait for the server to startup
    await state.starting
  }
}
