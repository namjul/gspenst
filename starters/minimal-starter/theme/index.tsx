import dynamic from 'next/dynamic'
import { useStore } from 'gspenst/data'

const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false })

const createLayout = () => {
  const Page = () => {
    const { state } = useStore()
    return (
      <div>
        <DynamicReactJson src={state} />
      </div>
    )
  }

  return Page
}

export default createLayout
