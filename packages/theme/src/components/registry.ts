import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import type { LiteralUnion } from 'type-fest'

// Inspiration:
// https://docs.stackbit.com/conceptual-guides/components/registering/
// https://github.com/stackbit-themes/starter-nextjs-theme/blob/main/src/components/components-registry.ts
// https://nextjs.org/docs/advanced-features/dynamic-import

export const components = {
  PageLayout: dynamic(() => import('./layouts/PageLayout')),
  PostLayout: dynamic(() => import('./layouts/PostLayout')),
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
