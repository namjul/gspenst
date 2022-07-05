import dynamic from 'next/dynamic'
import type { ThemeComponentProps } from 'gspenst/react'

const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false })

type ThemeConfig = {}

const createLayout = (config: ThemeConfig) => {
  const Page = (props: ThemeComponentProps) => {
    // useData('main')
    // usePost() -> useData('main')
    // usePosts() -> useData('posts')
    //
    return (
      <div>
        {config ? <DynamicReactJson src={config} /> : null}
        From `minimal-starter/theme`
        <DynamicReactJson src={props} />
      </div>
    )
  }

  return Page
}

export default createLayout
