import type { AsyncReturnType } from '@gspenst/utils'
import { ExperimentalGetTinaClient } from '../../.tina/__generated__/types'

export type StaticProps = AsyncReturnType<typeof resolveStaticProps>

export async function resolveStaticProps({
  name,
  relativePath,
}: {
  name?: string
  relativePath?: string
}) {
  const client = ExperimentalGetTinaClient() // eslint-disable-line @babel/new-cap

  const data = (() => {
    switch (name) {
      case 'post':
        return relativePath && client.getPost({ relativePath })
      case 'page':
        return relativePath && client.getPage({ relativePath })
      case 'author':
        return relativePath && client.getAuthor({ relativePath })
      default:
        return undefined
    }
  })()

  return data
}
