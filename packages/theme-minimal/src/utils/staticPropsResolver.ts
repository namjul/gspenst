import type {
  GetCollectionDocumentQuery,
  GetCollectionQuery,
} from '../../.tina/__generated__/types'

export function resolveStaticProps({
  data,
  query,
  variables,
}: {
  data: GetCollectionDocumentQuery | GetCollectionQuery
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
