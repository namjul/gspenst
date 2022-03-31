import EventEmitter from 'events'
import path from 'path'
import slugify from 'slugify'
import debug from 'debug'
import { Compiler } from 'webpack'
import pkg from '../package.json'
import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import { startTinaServer } from './tinaServer'
import { Cache } from './cache'
import type { ResourceItem, ResourceType } from './types'

const client = ExperimentalGetTinaClient() // eslint-disable-line new-cap

export const resourceMapCache = new Cache<{ [id: ID]: ResourceItem }>(
  'resources'
)

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
    const {
      data: { getCollections: resources },
    } = await client.getResources()

    const result = resources.reduce<{ [id: ID]: ResourceItem }>(
      (acc, current) => {
        ;(current.documents.edges ?? []).forEach((connectionEdge) => {
          if (connectionEdge?.node) {
            const {
              id,
              sys: { filename, path: filepath, relativePath },
            } = connectionEdge.node
            acc[id] = {
              id,
              filename,
              path: filepath,
              slug: slugify(filename),
              resource: current.name as ResourceType,
              relativePath,
            }
          }
        }, {})

        return acc
      },
      {}
    )
    await resourceMapCache.set(result)
  }
}
