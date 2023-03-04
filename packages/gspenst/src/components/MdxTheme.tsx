import { type TinaMarkdownContent, type Components, TinaMarkdown } from 'tinacms/dist/rich-text'
import { type Root } from '../shared/kernel'

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
