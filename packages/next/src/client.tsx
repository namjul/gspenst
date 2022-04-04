import { useTina } from 'tinacms/dist/edit-state'
import type { NextPage } from 'next'
import DynamicTinaProvider from './TinaDynamicProvider'
import type { PageProps } from './types'
import { resourceTypes } from './constants'

const Container: NextPage<{ pageProps: PageProps }> = ({
  pageProps: props,
}) => {
  const editableDataEntry = Object.entries(props.data).find(([type]) => {
    // @ts-expect-error -- fine
    return resourceTypes.includes(type)
  })

  if (!editableDataEntry) {
    throw new Error('No data was provided from getStaticProps')
  }

  const [, tinaData] = editableDataEntry

  const { data } = useTina({
    // @ts-expect-error -- TODO fine for now
    query: tinaData?.query,
    // @ts-expect-error -- TODO fine for now
    variables: tinaData?.variables,
    // @ts-expect-error -- TODO fine for now
    data: tinaData?.data,
  })
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

const Page: NextPage<{ pageProps: PageProps }> = ({ pageProps }) => {
  return (
    <DynamicTinaProvider>
      <Container pageProps={pageProps} />
    </DynamicTinaProvider>
  )
}

export default Page
