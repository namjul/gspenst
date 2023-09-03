import type { AstroIntegration } from 'astro'
import { type GspenstConfig } from './user-config'

export default function GspenstIntegration(
  _opts: GspenstConfig
): AstroIntegration[] {
  const Gspenst: AstroIntegration = {
    name: '@gspenst/astro',
    hooks: {
      'astro:config:setup': ({
        injectRoute,
        addClientDirective,
        config,
        updateConfig,
      }) => {
        injectRoute({
          pattern: '[...slug]',
          entryPoint: '@gspenst/astro/index.astro',
        })
        addClientDirective({
          name: 'tina',
          entrypoint: '@gspenst/astro/client-directive-tina',
        })
      },
    },
  }

  return [Gspenst]
}
