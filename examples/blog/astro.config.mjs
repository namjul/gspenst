import { defineConfig } from 'astro/config'
import gspenst from '@gspenst/astro'

// https://astro.build/config
export default defineConfig({
  integrations: [gspenst({
    routes: {}
  })],
})
