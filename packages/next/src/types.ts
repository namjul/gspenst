import type { PageProps as InternalPageProps } from './controller'
import type { HeadingsReturn } from './helpers/getHeaders'

/* --- Domain --- */

export type PageProps = Exclude<
  InternalPageProps,
  { context: 'internal' }
> & {} & {
  loading?: boolean
  headers?: HeadingsReturn
}
