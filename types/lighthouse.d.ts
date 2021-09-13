declare module 'lighthouse' {
  import type { RunnerResult } from 'lighthouse/types/externs'
  function lighthouse(url: string, opts: {}): Promise<RunnerResult | undefined>
  export = lighthouse
}
