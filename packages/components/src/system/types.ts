/* eslint-disable @typescript-eslint/no-explicit-any  */
import * as React from 'react'
import type { RenderProp } from '../utils/types'

export type As<P = any> = React.ElementType<P>

export type WrapElement = (element: React.ReactNode) => JSX.Element

export type Children<T extends keyof JSX.IntrinsicElements = any> =
  | React.ReactNode
  | RenderProp<React.ComponentPropsWithRef<NonNullable<T>>>

export type Options<T extends As = any> = { as?: T }

export type HTMLProps<O extends Options> = {
  wrapElement?: WrapElement
  children?: Children<O['as']>
} & Omit<React.ComponentPropsWithRef<NonNullable<O['as']>>, keyof O>

export type Props<O extends Options> = O & HTMLProps<O>

export type Component<O extends Options> = {
  <T extends As>(
    props: Omit<O, 'as'> & HTMLProps<Options<T>> & Required<Options<T>>
  ): JSX.Element
  (props: Props<O>): JSX.Element
  displayName?: string
}

export type Hook<O extends Options> = {
  <T extends As = NonNullable<O['as']>>(
    props?: Omit<O, 'as'> & HTMLProps<Options<T>> & Options<T>
  ): HTMLProps<Options<T>>
}
