/* eslint-disable @typescript-eslint/no-explicit-any  */

import type { Component, Options as ComponentOptions, Props } from './types'
import { forwardRef } from './forwardRef'
import { memo } from './memo'

type Options<O extends ComponentOptions> = {
  attach?: {
    displayName?: string
  }
  defaultProps?: Omit<Partial<O>, 'as'>
  memo?: boolean
}

export function createComponent<O extends ComponentOptions>(
  render: (props: Props<O>) => JSX.Element,
  { memo: shouldMemo = false, defaultProps, attach }: Options<O> = {}
) {
  let Comp = (props: Props<O>, ref: React.Ref<any>) => {
    return render({ ref, ...defaultProps, ...props })
  }

  Comp = forwardRef(Comp)

  if (shouldMemo) {
    Comp = memo(Comp)
  }

  return Object.assign(Comp, attach) as Component<O>
}
