import { createClient } from 'tinacms/dist/client'
import { env } from '../domain/env'
import { tinaConfig } from '../tina-config'
import { queries } from '../.tina/__generated__/types'

const { branch, clientId, token } = tinaConfig

const apiURL =
  env.NODE_ENV === 'production'
    ? `https://content.tinajs.io/content/${clientId}/github/${branch}`
    : 'http://localhost:4001/graphql'

export const client = createClient({
  queries,
  url: apiURL,
  token,
})
