declare module 'lighthouse' {
  import type { RunnerResult, Flags } from 'lighthouse/types/externs'
  function lighthouse(
    url: string,
    opts: Flags
  ): Promise<RunnerResult | undefined>
  export default lighthouse
  export type { RunnerResult, Flags }
}
