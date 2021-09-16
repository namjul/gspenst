import type { RunnerResult, Flags } from 'lighthouse/types/externs'
declare module 'lighthouse' {
  function lighthouse(
    url: string,
    opts: Flags
  ): Promise<RunnerResult | undefined>
  export default lighthouse
  export type { RunnerResult, Flags }
}
declare module 'lighthouse/lighthouse-core/lib/median-run' {
  function computeMedianRun(
    runs: Array<RunnerResult['lhr']>
  ): RunnerResult['lhr']
  export { computeMedianRun }
}
