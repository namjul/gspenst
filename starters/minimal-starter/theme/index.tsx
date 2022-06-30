import dynamic from 'next/dynamic'
import type { PageProps } from '@gspenst/next'

const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false })

const Page = (props: PageProps) => {
  console.log(props)
  return (
    <div>
      From `minimal-starter/theme`
      <DynamicReactJson src={props} />
    </div>
  )
}

export default (config: null | {}) => {
  console.log(JSON.stringify(config, null, 2))
  return Page
}
