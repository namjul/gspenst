import type { PageProps } from '@gspenst/next'

const Page = (props: PageProps) => {
  return (
    <div>
      From `minimal-starter/theme`
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  )
}

export default (config: null | {}) => {
  JSON.stringify(config, null, 2)
  return Page
}
