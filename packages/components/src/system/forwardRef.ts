/* eslint-disable @typescript-eslint/no-explicit-any  */
import { forwardRef as reactForwardRef, ForwardRefRenderFunction } from 'react'

export function forwardRef<T extends ForwardRefRenderFunction<any, any>>(
  component: T
) {
  return reactForwardRef(component) as unknown as T
}
