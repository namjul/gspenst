declare module 'sourcebit' {
  import type { Dict } from '@gspenst/utils'

  type Primitive = null | undefined | string | number | boolean | bigint

  export type ModelData<Fields extends string[] = string[]> = {
    fieldNames: Fields
    source: string
    modelName: string
    modelLabel: string
    projectId: string
    projectEnvironment: string
  }
  export type MetaData = {
    __metadata: {
      id: string
      source: string
      modelName: string
      modelLabel: string
      projectId: string
      projectEnvironment: string
      createdAt: DateTimeString
      updatedAt: DateTimeString
    }
  }

  type Data = {
    models: Array<ModelData>
    objects: Array<MetaData & Record<string, any>> // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  // https://github.com/stackbit/sourcebit/wiki/Plugin-API
  export type ISourcebitPlugin<
    SourcebitPluginOptions extends { [key: string]: unknown } = {},
    Context = {}
  > = {
    name: string
    options?: {
      [key in keyof SourcebitPluginOptions]?: {
        default: SourcebitPluginOptions[key] // The value to be used for this option in case one hasn't been supplied
        env: string // The name of an environment variable to read the value from
        private: boolean // Whether the option represents sensitive information and therefore should be stored in a .env file, rather than the main configuration file
        runtimeParameter: string // The name of a runtime parameter (e.g. CLI parameter) to read the value from. When present, the value of the parameter overrides any value defined in the configuration file.
      }
    }
    bootstrap?: (obj: {
      log: (msg: string) => void
      debug: (msg: string) => void
      getPluginContext: () => Context
      setPluginContext: (opts: Context) => void
      options: SourcebitPluginOptions
      refresh: () => void
    }) => void
    transform?: (obj: {
      log: (msg: string) => void
      debug: (msg: string) => void
      getPluginContext: () => Context
      options: SourcebitPluginOptions
      data: Data
    }) => Data | Promise<Data>
    getSetup?: (opj: {}) => void
    getOptionsFromSetup?: (opj: {}) => void
  }

  export type SourcebitPlugin<Options = Dict> = {
    module: ISourcebitPlugin<Options>
    options?: Options
  }

  export type SourcebitConfig = {
    plugins: Array<SourcebitPlugin>
  }

  export function fetch(config: SourcebitConfig)
}
