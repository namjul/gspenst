import { createClient } from 'tinacms/dist/client'
import { tinaClientId, tinaReadonlyTokens, nodeEnvironment } from '../env'
import { queries } from '../../.tina/__generated__/types'

const branch = 'main'
const apiURL =
  nodeEnvironment === 'production'
    ? `https://content.tinajs.io/content/${tinaClientId}/github/${branch}`
    : 'http://localhost:4001/graphql'

// TODO use queries from generated types
// See: https://tina.io/docs/graphql/read-only-tokens/#making-requests-with-the-tina-client
export const client = createClient({
  queries,
  url: apiURL,
  ...(tinaReadonlyTokens && { token: tinaReadonlyTokens }),
})
