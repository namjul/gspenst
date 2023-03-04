import { createClient } from 'tinacms/dist/client'
import { env } from '../domain/env'
import { queries } from '../../.tina/__generated__/types'

export const tinaConfig = {
  clientId: env.NEXT_PUBLIC_TINA_CLIENT_ID,
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH ?? // custom branch env override
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? // Vercel branch env
    process.env.HEAD ?? null, // Netlify branch env
  token: env.NEXT_PUBLIC_TINA_TOKEN!,
}

const { branch, clientId, token } = tinaConfig

const apiURL =
  process.env.NODE_ENV === 'production'
    ? `https://content.tinajs.io/content/${clientId}/github/${branch}`
    : 'http://localhost:4001/graphql'

export const client = createClient({
  queries,
  url: apiURL,
  token,
})

