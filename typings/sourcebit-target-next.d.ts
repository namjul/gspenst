/* eslint-disable @typescript-eslint/no-explicit-any */

import type { MetaData, ISourcebitPlugin } from 'sourcebit'

type Dict<T = any> = Record<string, T>

declare module 'sourcebit-target-next' {
  export type Props = {
    path: string
    page: Dict
  }

  export type SourcebitNextOptions = {
    // A flag indicating if page should reload its data when remote data changed. Defaults to true when NODE_ENV is set to development.
    liveUpdate?: boolean
    // An object mapping entries fetched by one of the source plugins to props that will be provided to all page components via getStaticProps.
    commonProps?: {
      [prop: string]: {
        single?: boolean
        predicate: (obj: MetaData & Dict) => boolean
      }
    }
    // An array of objects mapping entries fetched by one of the source plugins to props that will be provided to a specific page identified by its path via getStaticProps.
    pages?: Array<{
      path: string
      predicate: (obj: MetaData & Dict) => boolean
    }>
  }

  type SourcebitNextPlugin = ISourcebitPlugin<SourcebitNextOptions>

  export type SourcebitEntry<T = unknown> = T & MetaData

  export const name: SourcebitNextPlugin['name'],
    options: SourcebitNextPlugin['options'],
    bootstrap: SourcebitNextPlugin['bootstrap'],
    transform: SourcebitNextPlugin['transform'],
    getSetup: SourcebitNextPlugin['getSetup'],
    getOptionsFromSetup: SourcebitNextPlugin['getOptionsFromSetup'],
    sourcebitDataClient: {
      getData: <T extends MetaData>() => {
        pages: { path: string; page: T }[]
        props: NodeJS.Dict<T | T[]>
      }
    }
}
