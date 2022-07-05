import dynamic from 'next/dynamic'
import type { PageThemeContext } from 'gspenst'
import  { useData } from 'gspenst/data'

const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false })

type ThemeConfig = {}

const createLayout = (config: ThemeConfig) => {
  const Page = (_props: PageThemeContext) => {
    const { state } = useData()
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
