import EventEmitter from 'events'
import { type ChildProcess } from 'child_process'
import path from 'path'
import { type Compiler } from 'webpack' // eslint-disable-line import/no-extraneous-dependencies
import { type Option } from 'gspenst'
import { startTinaServer, repository, reloadTinaServer } from 'gspenst/server'
import pkg from '../package.json'
import { IS_PRODUCTION } from './constants'

// api lookup: https://webpack.js.org/api/plugins/
// example: https://github.com/shellscape/webpack-plugin-serve/blob/master/lib/index.js

const key = `${pkg.name}:plugin`
const state: { starting?: Promise<ChildProcess | undefined> } = {}

function debounce(func: (...args: unknown[]) => void, wait: number = 200) {
  let timeout: Option<NodeJS.Timer>
  return (...args: unknown[]) => {
    const later = () => {
      timeout = undefined
      func(...args) // eslint-disable-line @typescript-eslint/no-unsafe-argument
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

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
      repository.subscribe(
        debounce((data) => {
          console.log('repository update', data)
          void reloadTinaServer()
        }, 500)
      )
    }

    // wait for the server to startup
    await state.starting
  }
}
