import type { AsyncReturnType } from 'type-fest'
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
        if (relativePath) {
          return client.getPost({ relativePath })
        }
        return undefined
      case 'page':
        if (relativePath) {
          return client.getPage({ relativePath })
        }
        return undefined
      case 'author':
        if (relativePath) {
          return client.getAuthor({ relativePath })
        }
        return undefined
      default:
        return undefined
    }
  })()

  return data
}
