import { defineConfig as _defineConfig, type Schema } from 'tinacms'
import { env } from './domain/env'

export const tinaConfig = {
  clientId: env.NEXT_PUBLIC_TINA_CLIENT_ID ?? null,
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH ?? // custom branch env override
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? // Vercel branch env
    process.env.HEAD ??
    null, // Netlify branch env
  token: env.NEXT_PUBLIC_TINA_TOKEN!,
}

type Options = { schema: Schema }

export function defineConfig({ schema }: Options) {
  return _defineConfig({
    schema,
    ...tinaConfig,
    build: {
      publicFolder: 'public', // The public asset folder for your framework
      outputFolder: 'admin', // within the public folder
    },
    media: {
      tina: {
        publicFolder: 'public',
        mediaRoot: 'uploads',
      },
    },
  })
}
