import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import type { LiteralUnion } from '@gspenst/utils'
// import PageLayout from './components/PageLayout';

// https://docs.stackbit.com/conceptual-guides/components/registering/
// https://github.com/stackbit-themes/starter-nextjs-theme/blob/main/src/components/components-registry.ts
// https://nextjs.org/docs/advanced-features/dynamic-import
// preconstruct does not add `__esmodule` flag therefore mapping to `mod.default`

const components = {
  PageLayout: dynamic(() => {
    const Comp = import('./layouts/PageLayout').then((mod) => mod.default)
    return Comp
  }),
  PostLayout: dynamic(() => {
    const Comp = import('./layouts/PostLayout').then((mod) => mod.default)
    return Comp
  }),
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
