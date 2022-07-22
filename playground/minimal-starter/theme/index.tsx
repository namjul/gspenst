// import dynamic from 'next/dynamic'
import { useStore } from 'gspenst/data'

// const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false })

const createLayout = () => {
  const Page = () => {
    const { state } = useStore()
    return (
      <div>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
    )
  }

  return Page
}

export default createLayout
