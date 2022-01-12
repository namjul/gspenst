import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import type { LiteralUnion } from '@gspenst/utils'

// https://github.com/stackbit-themes/starter-nextjs-theme/blob/main/src/components/components-registry.ts
// https://nextjs.org/docs/advanced-features/dynamic-import
// preconstruct does not add `__esmodule` flag therefore mapping to `mod.default`

const components = {
  page: dynamic(() => {
    const Comp = import('./components/PageLayout').then((mod) => mod.default)
    return Comp
  }),
  post: dynamic(() => {
    const Comp = import('./components/PostLayout').then((mod) => mod.default)
    return Comp
  }),
}

export default function getComponent<
  T extends LiteralUnion<keyof typeof components, string>
>(key: T) {
  return (
    components as typeof components & { [componentName: string]: ComponentType }
  )[key]
}
