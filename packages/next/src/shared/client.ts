import { createClient } from 'tinacms/dist/client'
import { tinaClientId, tinaReadonlyTokens, nodeEnvironment } from '../env'

const branch = 'main'
const apiURL =
  nodeEnvironment === 'production'
    ? `https://content.tinajs.io/content/${tinaClientId}/github/${branch}`
    : 'http://localhost:4001/graphql'

export const client = createClient({
  url: apiURL,
  ...(tinaReadonlyTokens && { token: tinaReadonlyTokens }),
})
