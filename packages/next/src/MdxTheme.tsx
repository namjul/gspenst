import { TinaMarkdown } from 'tinacms/dist/rich-text'
import type { TinaMarkdownContent, Components } from 'tinacms/dist/rich-text'
import type { Root } from '@gspenst/core'

const MDXTheme = ({
  content,
  components,
}: {
  content: Root | undefined
  components?: Components<{}> | undefined
}) => {
  return (
    <TinaMarkdown
      {...(components && { components })}
      content={content as unknown as TinaMarkdownContent}
    />
  )
}

export default MDXTheme
