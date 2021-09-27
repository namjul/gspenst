import type { ElementType } from 'react'
import { isRenderProp } from '../utils/isRenderProp'
import { HTMLProps, Options } from './types'

export function createElement(Type: ElementType, props: HTMLProps<Options>) {
  const { as: As, children, wrapElement, ...rest } = props
  let element: JSX.Element
  if (As && typeof As !== 'string') {
    element = <As {...rest}>{children}</As>
  } else if (isRenderProp(children)) {
    element = children(rest)
  } else if (As) {
    element = <As {...rest}>{children}</As>
  } else {
    element = <Type {...rest}>{children}</Type>
  }
  if (wrapElement) {
    return wrapElement(element)
  }
  return element
}
