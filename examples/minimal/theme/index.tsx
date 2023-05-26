import { selectData } from 'gspenst/data'
import { type GspenstThemeLayoutProps } from '@gspenst/next'
import dynamic from 'next/dynamic'

const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false })

export default function Layout({ context, pageMap }: GspenstThemeLayoutProps) {
  const denormalizedContext = selectData(context)
  return (
    <div>
      <DynamicReactJson
        src={{ context, denormalizedContext, pageMap }}
        collapsed={true}
      />
    </div>
  )
}
