import { TinaMarkdown } from 'tinacms/dist/rich-text'
import type { TinaMarkdownContent, Components } from 'tinacms/dist/rich-text'
import type { Root } from './types'

const MDXTheme = ({
  content,
  components,
}: {
  content: Root
  components?: Components<{}> | undefined
}) => {
  return (
    <TinaMarkdown
      {...(components && { components })}
      content={content as TinaMarkdownContent}
    />
  )
}

export default MDXTheme
