import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import  { type LiteralUnion } from 'type-fest'

export const components = {
  MdxTheme: dynamic(() => import('gspenst/components/MdxTheme')),
}

export default function getComponent<
  T extends LiteralUnion<keyof typeof components, string>
>(key: T | undefined | null) {
  return key
    ? (
        components as typeof components & {
          [componentName: string]: ComponentType
        }
      )[key]
    : undefined
}
