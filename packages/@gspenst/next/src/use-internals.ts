import { type GspenstInternalGlobal } from './types'
import { GSPENT_INTERNAL } from './constants'

export function useInternals() {
  const __gspenst_internal__ = (globalThis as GspenstInternalGlobal)[
    GSPENT_INTERNAL
  ]

  return {
    Layout: __gspenst_internal__.Layout,
    pageMap: __gspenst_internal__.pageMap,
  }
}
