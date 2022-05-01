import { Simplify } from 'type-fest'
import type { PageProps as InternalPageProps } from './controller'
import type { HeadingsReturn } from './getHeaders'

/* --- Domain --- */

export type PageProps = Simplify<
  Exclude<InternalPageProps, { context: 'internal' }> & {}
> & {
  loading?: boolean
  headers?: HeadingsReturn
}
