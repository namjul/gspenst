/* eslint-disable @typescript-eslint/no-explicit-any  */
import { memo as reactMemo, ComponentType, ComponentProps } from 'react'

export function memo<T extends ComponentType<any>>(
  component: T,
  propsAreEqual?: (
    prevProps: Readonly<ComponentProps<T>>,
    nextProps: Readonly<ComponentProps<T>>
  ) => boolean
) {
  return reactMemo(component, propsAreEqual) as unknown as T
}
