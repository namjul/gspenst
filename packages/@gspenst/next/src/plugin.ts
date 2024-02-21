import EventEmitter from 'events'
import { type ChildProcess } from 'child_process'
import path from 'path'
import { type Compiler } from 'webpack'
import { startTinaServer } from 'gspenst/server'
import pkg from '../package.json'
import { IS_PRODUCTION } from './constants'

// api lookup: https://webpack.js.org/api/plugins/
// example: https://github.com/shellscape/webpack-plugin-serve/blob/master/lib/index.js

const key = `${pkg.name}:plugin`
const state: { starting?: Promise<ChildProcess | undefined> } = {}

// TODO graceful and plugin when nextjs restarts
export class GspenstPlugin extends EventEmitter {
  compiler?: Compiler
  packagePath: string = path.dirname(
    require.resolve(`@gspenst/next/package.json`)
  )
  projectPath: string = process.cwd()

  constructor() {
    super()

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
        if (!IS_PRODUCTION) {
          await this.start()
        }
      })
    }
  }

  async start() {
    if (!state.starting) {
      // ensure we're only trying to start the server once
      state.starting = startTinaServer.bind(this)({ onlyCheck: false })
    }

    // wait for the server to startup
    await state.starting
  }
}
