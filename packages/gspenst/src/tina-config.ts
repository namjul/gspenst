import { defineConfig as _defineConfig } from 'tinacms'
import { type Schema } from './tina-schema'
import { tinaConfig } from './shared/client'

type Options = { schema: Schema }

export function defineConfig({ schema }: Options) {
  return _defineConfig({
    schema,
    ...tinaConfig,
    build: {
      publicFolder: 'public', // The public asset folder for your framework
      outputFolder: 'admin', // within the public folder
    },
  })
}
