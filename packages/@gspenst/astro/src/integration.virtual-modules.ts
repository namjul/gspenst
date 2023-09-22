import type { AstroConfig, ViteUserConfig } from 'astro'
import { GspenstConfig } from './user-config'

function resolveVirtualModuleId<T extends string>(id: T): `\0${T}` {
  return `\0${id}`
}

/** Vite plugin that exposes project context via virtual modules. */
export function vitePluginGspenstVirtualModules(
  opts: GspenstConfig,
  { root }: Pick<AstroConfig, 'root'>,
): NonNullable<ViteUserConfig['plugins']>[number] {



  /** Map of virtual module names to their code contents as strings. */
  const modules = {
    'virtual:gspenst/project-context': `export default ${JSON.stringify({
      root,
    })}`,
    'virtual:gspenst/user-config': `export default ${JSON.stringify(opts)}`,
  } satisfies Record<string, string>

  /** Mapping names prefixed with `\0` to their original form. */
  const resolutionMap = Object.fromEntries(
    (Object.keys(modules) as (keyof typeof modules)[]).map((key) => [
      resolveVirtualModuleId(key),
      key,
    ]),
  )

  return {
    name: 'vite-plugin-gspenst-virtual-modules',
    resolveId(id): string | void {
      if (id in modules) return resolveVirtualModuleId(id)
    },
    load(id): string | void {
      const resolution = resolutionMap[id]
      if (resolution) return modules[resolution]
    },
  }
}
