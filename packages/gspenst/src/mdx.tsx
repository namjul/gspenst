import {
  type TinaMarkdownContent,
  type Components,
  TinaMarkdown,
} from 'tinacms/dist/rich-text'
import { type Root } from './shared/kernel'

export const MDXProvider = ({
  children,
  components,
}: {
  children: Root | undefined
  components?: Components<{}> | undefined
}) => {
  return (
    <TinaMarkdown
      {...(components && { components })}
      content={children as unknown as TinaMarkdownContent}
    />
  )
}

