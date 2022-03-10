import type { NextPage } from 'next'
import { createElement } from 'react'

const Page: NextPage = (props) => {
  return createElement('div', {}, JSON.stringify(props, null, 2))
}

export default Page
