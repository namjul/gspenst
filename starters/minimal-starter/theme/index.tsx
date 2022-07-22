import { useStore } from 'gspenst/data'

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
