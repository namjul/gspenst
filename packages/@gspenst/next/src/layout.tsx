import { ReactElement } from 'react'
import { type ThemeContext, type Resource } from 'gspenst'
import { useTina } from 'tinacms/dist/react'
import { useInternals } from './use-internals'

export default function Gspenst(props: ThemeContext): ReactElement {
  const { Layout, pageMap } = useInternals()

  if (props.resource.type === 'routes') {
    throw new Error('routes resource should not land on client')
  }

  const { data } = props.resource

  const { data: tinaData } = useTina({
    query: data.query,
    variables: data.variables,
    data: data.data,
  })

  const resource = {
    ...props.resource,
    data: {
      ...data,
      data: { ...data.data, ...tinaData },
    },
  } as Resource

  return (
    <Layout context={{ ...props, resource }} pageMap={pageMap} />
  )
}
