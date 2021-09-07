import { Hook, Options, HTMLProps, Props } from './types'

export function createHook<O extends Options>(
  useProps: (props: Props<O>) => HTMLProps<O>
) {
  return useProps as Hook<O>
}
