import { css } from '../../stitches.config'
import type { CSS } from '../../stitches.config'
import { As, Options, HTMLProps, Props } from '../../system/types'
import { createHook } from '../../system/createHook'
import { createElement } from '../../system/createElement'
import { createComponent } from '../../system/createComponent'
import { styles } from './Text.styles'

const cssText = css(styles)

const DEFAULT_TAG = 'span'

type ComponentType = typeof DEFAULT_TAG

export type TextOptions<T extends As = ComponentType> = Options<T> & {
  css?: CSS
}

export type TextHTMLProps<T extends As = ComponentType> = HTMLProps<
  TextOptions<T>
>

export type TextProps<T extends As = ComponentType> = Props<TextOptions<T>>

export const useText = createHook<TextOptions>((props) => {
  props = cssText(props).props
  return props
})

export const Text = createComponent<TextOptions>(
  (props) => {
    props = useText(props)
    return createElement(DEFAULT_TAG, props)
  },
  { attach: { displayName: 'Text' } }
)
