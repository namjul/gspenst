import type { NextPage } from 'next'
import { useTina } from 'tinacms/dist/edit-state'
import { transformData } from '../utils/dataTransformer'
import type { StaticProps } from '../utils/staticPropsResolver'
import defaultConfig from '../default.config'
import { ThemeConfigContext } from '../config'
import getComponent from './registry'
import Head from './patterns/Head'

const Page: NextPage<StaticProps> = (props) => {
  if (typeof props.data === 'undefined') {
    throw new Error('TODO')
  }

  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  const { page, config } = transformData(data)

  if (!page) {
    throw new Error('TODO')
  }

  const { layout } = page

  const PageLayout = getComponent(layout)

  if (!PageLayout) {
    throw new Error(`no page layout matching the layout: ${page.layout}`)
  }

  const extendedConfig = { ...defaultConfig, ...config.data }

  return (
    <ThemeConfigContext.Provider value={extendedConfig}>
      <Head page={page} />
      <PageLayout
        /* @ts-expect-error -- PageLayout is dynamically retrieved */
        page={page}
      />
    </ThemeConfigContext.Provider>
  )
}

export default Page
