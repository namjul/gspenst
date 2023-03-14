import { type TinaTemplate } from 'gspenst'

export const BlockQuote = ({
  quote,
  authorName,
}: {
  quote: string
  authorName: string
}) => {
  return (
    <>
      <blockquote>{quote}</blockquote>
      <span>{authorName}</span>
    </>
  )
}

export const testimonialBlockSchema: TinaTemplate = {
  name: 'BlockQuote',
  label: 'Block Quote',
  fields: [
    {
      name: 'quote',
      label: 'Quote',
      type: 'string',
      ui: {
        component: 'textarea',
      },
    },
    {
      name: 'authorName',
      label: 'Author',
      type: 'string',
    },
  ],
}
