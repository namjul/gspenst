import type { MetaData } from 'sourcebit'

declare module 'sourcebit-target-next' {
  export type SourcebitNextOptions = {
    pages: Array<{
      path: string
      predicate: (
        obj: { __metadata: MetaData } & { [key: string]: any }
      ) => boolean
    }>
  }
}
