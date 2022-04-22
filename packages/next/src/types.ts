import { Simplify } from 'type-fest'
import { themeContextTypes, routingContextTypes } from './constants'
import type { PageProps as InternalPageProps } from './controller'
import type { HeadingsReturn } from './getHeaders'

/* --- Domain --- */

export type RoutingContextType = typeof routingContextTypes[number]
export type ThemeContextType = typeof themeContextTypes[number]

export type PageProps = Simplify<
  Exclude<InternalPageProps, { context: 'internal' }> & {}
> & {
  loading?: boolean
  headers?: HeadingsReturn
}
