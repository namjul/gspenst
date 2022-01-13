import path from 'path'
import type { ISourcebitPlugin } from 'sourcebit'
import type { Dict } from '@gspenst/utils'

type Options = { theme: string; themeConfig: string; [key: string]: unknown }

type SourebitPluginType = ISourcebitPlugin<Options, {}>

export const name: SourebitPluginType['name'] = 'gspenst-source-theme'

export const transform: Exclude<
  SourebitPluginType['transform'],
  undefined
> = async ({ options, data }) => {
  const themeConfigPath =
    options.themeConfig && path.resolve(options.themeConfig)
  const themeConfig = require(themeConfigPath) as Dict //eslint-disable-line @typescript-eslint/no-var-requires

  const settings = {
    ...themeConfig,
    __metadata: {
      source: name,
      id: 'theme-config-id',
      modelName: 'theme-config',
      modelLabel: 'Theme Config',
      projectId: '',
      projectEnvironment: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  return {
    ...data,
    objects: data.objects.concat(settings),
  }
}
