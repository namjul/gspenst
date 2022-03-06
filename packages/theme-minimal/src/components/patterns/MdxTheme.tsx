import { TinaMarkdown } from 'tinacms/dist/rich-text'
import type { TinaMarkdownContent } from 'tinacms/dist/rich-text'
import type { Root } from '../../types'

const components = {
  // h1: H1,
  // h2: H2,
  // h3: H3,
  // h4: H4,
  // h5: H5,
  // h6: H6,
  // a: A,
  // pre: Pre,
}

const MDXTheme = ({ content }: { content: Root }) => {
  return (
    <TinaMarkdown
      components={components}
      content={content as TinaMarkdownContent}
    />
  )
}

export default MDXTheme
