import { css } from '../../stitches.config'
import type { CSS } from '../../stitches.config'
import { As, Options, HTMLProps, Props } from '../../system/types'
import { createHook } from '../../system/createHook'
import { createElement } from '../../system/createElement'
import { createComponent } from '../../system/createComponent'
import { styles } from './View.styles'

const cssView = css(styles)

const DEFAULT_TAG = 'div'

type ComponentType = typeof DEFAULT_TAG

export type ViewOptions<T extends As = ComponentType> = Options<T> & {
  css?: CSS
}

export type ViewHTMLProps<T extends As = ComponentType> = HTMLProps<
  ViewOptions<T>
>

export type ViewProps<T extends As = ComponentType> = Props<ViewOptions<T>>

export const useView = createHook<ViewOptions>((props) => {
  return cssView(props).props
})

export const View = createComponent<ViewOptions>(
  (props) => {
    props = useView(props)
    return createElement(DEFAULT_TAG, props)
  },
  { attach: { displayName: 'View' } }
)
