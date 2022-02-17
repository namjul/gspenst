import type { GetCollectionDocumentQuery } from '../../.tina/__generated__/types'

export function resolveStaticProps({
  data,
  query,
  variables,
}: {
  data: GetCollectionDocumentQuery
  query: any
  variables: any
}) {
  // TODO make transformations
  return {
    data,
    query,
    variables,
  }
}
