import 'dotenv/config'
import type { AstroIntegration, AstroUserConfig } from 'astro'
import EventEmitter from 'events'
import { startTinaServer } from 'gspenst/server'
import { type GspenstConfig } from './user-config'
import { vitePluginGspenstVirtualModules } from './integration.virtual-modules'

class GspenstPlugin extends EventEmitter {
  projectPath: string = process.cwd()
  constructor() {
    super()
    process.on('exit', () => {
      this.emit('cleanup')
    })
  }
  async start() {
    await startTinaServer.bind(this)({ onlyCheck: false })
  }
}

export default function GspenstIntegration(
  _opts: GspenstConfig,
): AstroIntegration[] {
  const Gspenst: AstroIntegration = {
    name: '@gspenst/astro',
    hooks: {
      'astro:config:setup': async ({
        config,
        injectRoute,
        updateConfig,
        addClientDirective,
      }) => {
        injectRoute({
          pattern: '[...slug]',
          entryPoint: '@gspenst/astro/index.astro',
        })
        addClientDirective({
          name: 'tina',
          entrypoint: '@gspenst/astro/directive-tina-client',
        })

        const newConfig: AstroUserConfig = {
          vite: {
            plugins: [vitePluginGspenstVirtualModules(_opts, config)],
          },
        }
        updateConfig(newConfig)
      },
      'astro:server:setup': async () => {
        const plugin = new GspenstPlugin()
        await plugin.start()
      },
      'astro:build:setup': async (options) => {},
    },
  }

  return [Gspenst]
}
