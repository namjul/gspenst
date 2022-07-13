import { createClient } from 'tinacms/dist/client'
import { queries } from '../../.tina/__generated__/types'

const branch = 'main'
const apiURL =
  process.env.NODE_ENV === 'production'
    ? `https://content.tinajs.io/content/${process.env.NEXT_PUBLIC_TINA_CLIENT_ID}/github/${branch}`
    : 'http://localhost:4001/graphql'

export const client = createClient({
  queries,
  url: apiURL,
  ...(process.env.NEXT_PUBLIC_TINA_READONLY_TOKEN && {
    token: process.env.NEXT_PUBLIC_TINA_READONLY_TOKEN,
  }),
})
