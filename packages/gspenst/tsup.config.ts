import { defineConfig } from 'tsup'

export default defineConfig([
  {
    name: 'gspenst',
    entry: ['src/index.ts', 'src/server.ts', 'src/schema.ts', 'src/data.ts'],
    format: ['esm'],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
    external: ['gspenst/pageMap.json'],
  },
  {
    name: 'gspenst/cli',
    entry: ['src/cli.ts'],
    format: ['cjs'],
  },
])
