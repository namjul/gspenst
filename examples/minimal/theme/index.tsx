import { type GspenstThemeLayoutProps } from '@gspenst/next'
import dynamic from 'next/dynamic'

const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false })

export default function Layout(props: GspenstThemeLayoutProps) {
  return (
    <div>
      <DynamicReactJson src={props} collapsed={true} />
    </div>
  )
}
