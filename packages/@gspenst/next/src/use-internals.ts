import { type GspenstInternalGlobal } from './types'
import { GSPENT_INTERNAL } from './constants'

export function useInternals() {
  const __gspenst_internal__ = (globalThis as GspenstInternalGlobal)[
    GSPENT_INTERNAL
  ]

  // TODO subscribe listener and set current active route

  return __gspenst_internal__
}
