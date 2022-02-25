import type { Data } from '../types'

export function resolveStaticProps({
  data,
  query,
  variables,
}: {
  data: Data
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
