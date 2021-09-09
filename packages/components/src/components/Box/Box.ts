import { css } from '../../stitches.config'
import type { CSS } from '../../stitches.config'
import { As, Options, HTMLProps, Props } from '../../system/types'
import { createHook } from '../../system/createHook'
import { createElement } from '../../system/createElement'
import { createComponent } from '../../system/createComponent'
import { styles } from './Box.styles'

const cssBox = css(styles)

const DEFAULT_TAG = 'div'

type ComponentType = typeof DEFAULT_TAG

export type BoxOptions<T extends As = ComponentType> = Options<T> & {
  css?: CSS
}

export type BoxHTMLProps<T extends As = ComponentType> = HTMLProps<
  BoxOptions<T>
>

export type BoxProps<T extends As = ComponentType> = Props<BoxOptions<T>>

export const useBox = createHook<BoxOptions>((props) => {
  props = cssBox(props).props
  return props
})

export const Box = createComponent<BoxOptions>(
  (props) => {
    props = useBox(props)
    return createElement(DEFAULT_TAG, props)
  },
  { attach: { displayName: 'Box' } }
)
