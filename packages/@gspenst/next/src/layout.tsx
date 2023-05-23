import { ReactElement } from 'react'
import { type ThemeContext } from 'gspenst'
import { useInternals } from './use-internals'

export default function Gspenst(props: ThemeContext): ReactElement {
  const { Layout, pageMap } = useInternals()

  return (
    <Layout context={props} pageMap={pageMap}>
      TOOD embed Layout
    </Layout>
  )
}
