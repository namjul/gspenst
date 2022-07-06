import dynamic from 'next/dynamic'
import type { PageThemeContext } from 'gspenst'
import { useStore, useData } from 'gspenst/data'

const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false })

type ThemeConfig = {}

const createLayout = (config: ThemeConfig) => {
  const Page = (_props: PageThemeContext) => {
    const { state } = useStore()
    // usePost() -> useData('main')
    // usePosts() -> useData('posts')
    return (
      <div>
        {config ? <DynamicReactJson src={config} /> : null}
        <DynamicReactJson src={state} />
      </div>
    )
  }

  return Page
}

export default createLayout
