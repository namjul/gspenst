import { createClient } from 'tinacms/dist/client'
import { tinaClientId, tinaReadonlyTokens, nodeEnvironment } from '../env'

const branch = 'main'
const apiURL =
  nodeEnvironment === 'production'
    ? `https://content.tinajs.io/content/${tinaClientId}/github/${branch}`
    : 'http://localhost:4001/graphql'

// TODO use queries from generated types
// See: https://tina.io/docs/graphql/read-only-tokens/#making-requests-with-the-tina-client
export const client = createClient({
  url: apiURL,
  ...(tinaReadonlyTokens && { token: tinaReadonlyTokens }),
})
