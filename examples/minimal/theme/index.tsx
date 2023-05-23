import { useGspenstState } from 'gspenst/data'
import { type GspenstThemeLayoutProps } from '@gspenst/next'
import dynamic from 'next/dynamic'

const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false })

export default function Layout({
  context,
  pageMap,
}: GspenstThemeLayoutProps) {
  const x = useGspenstState(context, pageMap)
  return (
    <div>
      <DynamicReactJson src={x} collapsed={true} />
    </div>
  )
}
