import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import type { LiteralUnion } from 'type-fest'

export const components = {
  Admin: dynamic(() => import('gspenst/Admin')),
  MdxTheme: dynamic(() => import('gspenst/react')),
  TinaProvider: dynamic(() => import('gspenst/TinaProvider'), { ssr: false }),
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
