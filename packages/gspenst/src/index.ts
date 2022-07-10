export type { TinaTemplate, TinaField } from 'tinacms'
export type { Root } from './shared/kernel'
export type { Resource, LocatorResource } from './domain/resource'
export type { Post } from './domain/post'
export type { Page } from './domain/page'
export type { Author } from './domain/author'
export type { Tag } from './domain/tag'
export type { RoutesConfig } from './domain/routes'
export type { ThemeContext, PageThemeContext } from './domain/theming'

export * as Errors from './errors'
export { parseRoutesWithDefaults as parseRoutes } from './domain/routes'
export { createRoutingMapping } from './helpers/createRoutingMapping'
export { default as getHeaders } from './helpers/getHeaders'
export { client } from './shared/client'
export { createSchema } from './schema'